const express = require('express');
const sendBulkMsg = require('../controllers/SendBulkMsg');
const handleCsv = require('../controllers/HandleCsv');
const restartClient = require('../controllers/RestartClient');
const CreateCampaign = require('../controllers/CreateCampaign');
const {AddContactGroup , getContacts , getContactsById} = require('../controllers/AddContacts');

module.exports = (io, client, isClientReadyRef) => {
    const router = express.Router();

    router.post('/send', ...sendBulkMsg(client, io, isClientReadyRef));
    router.post('/upload', handleCsv);
    router.post('/restart-client', restartClient(client, isClientReadyRef));
    router.post('/campaign', CreateCampaign);
    router.post('/contacts', AddContactGroup);
    router.get('/getcontacts', getContacts);
    router.get('/contacts/:id', getContactsById);

    router.get('/client-info', async (req, res) => {
        try {
            const info = client.info;
            if (!info) {
                return res.status(404).json({ error: 'Client not initialized yet' });
            }

            const profilePicUrl = await client.getProfilePicUrl(info.wid._serialized);
            res.json({
                name: info.pushname || "Unknown",
                number: info.wid.user,
                platform: info.platform,
                profilePicUrl
            });
        } catch (error) {
            console.error("Error getting client info:", error);
            res.status(500).json({ error: 'Failed to fetch client info' });
        }
    });



    return router;
};
