const express = require('express');
const sendBulkMsg = require('../controllers/SendBulkMsg');
const handleCsv = require('../controllers/HandleCsv');
const {CreateCampaign , deleteCampaign} = require('../controllers/CreateCampaign');
const {AddContactGroup , getContacts , getContactsById , deleteGroupContact} = require('../controllers/AddContacts');
const getCampaignStats = require('../controllers/getCampaignStats');
const getCampaignById = require('../controllers/GetCampaignById')
const uploadCSV = require('../controllers/uploadCSV');
const controller = require('../controllers/chatbotController');

module.exports = (io, client, isClientReadyRef) => {
    const router = express.Router();
    router.post('/send', ...sendBulkMsg(client, io, isClientReadyRef));
    router.post('/upload', handleCsv);
    router.post('/campaign', CreateCampaign);
    router.post('/contacts', AddContactGroup);
    router.delete('/contacts/:id', deleteGroupContact);
    router.get('/getcontacts', getContacts);
    router.get('/contacts/:id', getContactsById);
    router.delete('/deleteCampaign/:id', deleteCampaign);
    router.get('/campaign-stats', getCampaignStats);
    router.get('/campaign/:id', getCampaignById);
    router.post('/upload-csv', uploadCSV);
    router.post('/chatbot/rules', controller.saveChatbotRule);
    router.get('/chatbot/rules', controller.getAllChatbotRules);
    router.post('/chatbot/keywords', controller.saveKeywordGroup);
    router.get('/chatbot/keywords', controller.getAllKeywordGroups);
    router.get('/chatbot-conversations' , controller.getConversation)
    router.get('/chatbotStats' , controller.getBotReplyStats)

    router.get('/client-info', async (req, res) => {
        try {
            if (!isClientReadyRef?.value) {
                return res.status(404).json({ error: 'Not connected' });
            }
            const info = client.info;
            if (!info || !info.wid) {
                return res.status(404).json({ error: 'Client info not available' });
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
