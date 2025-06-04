const express = require('express');
const sendBulkMsg = require('../controllers/SendBulkMsg');
const handleCsv = require('../controllers/HandleCsv');
const { CreateCampaign, deleteCampaign } = require('../controllers/CreateCampaign');
const { AddContactGroup, getContacts, getContactsById, deleteGroupContact } = require('../controllers/AddContacts');
const {getCampaignStats , getAllCampaignStats} = require('../controllers/getCampaignStats');
const getCampaignById = require('../controllers/GetCampaignById');
const uploadCSV = require('../controllers/uploadCSV');
const controller = require('../controllers/chatbotController');
const authController = require('../controllers/authController')
const botController = require('../controllers/botController');
const ClientInfo = require('../controllers/ClientInfo');

module.exports = (io) => {
    const router = express.Router();

    //auth router
    router.post("/signup", authController.signup);
    router.post("/login", authController.login);


    // Bulk Messaging Routes
    router.post('/send', ...sendBulkMsg(io));
    router.post('/upload', handleCsv);

    // Campaign & Contact Routes
    router.post('/campaign', CreateCampaign);
    router.post('/campaign-stats', getCampaignStats);
    router.post('/campaign-all-stats', getAllCampaignStats);
    router.get('/campaign/:id', getCampaignById);
    router.delete('/deleteCampaign/:id/:userId', deleteCampaign);

    router.post('/contacts', AddContactGroup);
    router.post('/getContacts', getContacts);
    router.delete('/contacts/:id', deleteGroupContact);
    router.get('/contacts/:id', getContactsById);

    router.post('/upload-csv', uploadCSV);

    // Chatbot Routes
    router.post('/chatbot/save-rules', controller.saveChatbotRule);
    router.post('/chatbot/rules', controller.getAllChatbotRules);
    router.post('/chatbot/save-keywords', controller.saveKeywordGroup);
    router.post('/chatbot/keywords', controller.getAllKeywordGroups);
    router.post('/chatbot-conversations', controller.getConversation);
    router.post('/chatbotStats', controller.getBotReplyStats);

    // Bot
    router.post('/bot/status', botController.setBotStatus);
    router.get('/bot/status', botController.getBotStatus);

    // WhatsApp Client Info & Logout
    router.post('/client-info', ClientInfo)



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
