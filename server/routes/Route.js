const express = require('express');
const sendBulkMsg = require('../controllers/SendBulkMsg');
const handleCsv = require('../controllers/HandleCsv');
const restartClient = require('../controllers/RestartClient');
const CreateCampaign = require('../controllers/CreateCampaign');
const {AddContactGroup , getContacts , getContactsById} = require('../controllers/AddContacts');
const getCampaignStats = require('../controllers/getCampaignStats');

module.exports = (io, client, isClientReadyRef) => {
    const router = express.Router();

    router.post('/send', ...sendBulkMsg(client, io, isClientReadyRef));
    router.post('/upload', handleCsv);
    router.post('/restart-client', restartClient(client, isClientReadyRef));
    router.post('/campaign', CreateCampaign);
    router.post('/contacts', AddContactGroup);
    router.get('/getcontacts', getContacts);
    router.get('/contacts/:id', getContactsById);
    router.get('/campaign-stats', getCampaignStats);
    router.get('/client-info', async (req, res) => {
        try {
            const info = client.info;
            if (!info || !info.wid || client.pupBrowser?.isConnected?.() === false) {
                return res.status(404).json({ error: 'Not connected' });
            }

            let profilePicUrl = '';
            try {
                profilePicUrl = await client.getProfilePicUrl(info.wid._serialized);
            } catch {
                profilePicUrl = '';
            }

            res.json({
                name: info.pushname || 'Unknown',
                number: info.wid.user,
                platform: info.platform,
                profilePicUrl,
            });

        } catch (err) {
            console.error('⚠️ Error fetching client info:', err.message);
            res.status(500).json({ error: 'Failed to fetch client info' });
        }
    });


    router.post('/logout', async (req, res) => {
        try {
            await client.logout();
            isClientReadyRef.value = false;
            await client.destroy();
            client.initialize();
            res.json({ success: true });
        } catch (err) {
            console.error("Logout error:", err);
            res.status(500).json({ error: "Logout failed." });
        }
    });




    return router;
};
