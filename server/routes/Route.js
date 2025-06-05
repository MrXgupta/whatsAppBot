const express = require('express');
const sendBulkMsg = require('../controllers/SendBulkMsg');
const handleCsv = require('../controllers/HandleCsv');
const { CreateCampaign, deleteCampaign } = require('../controllers/CreateCampaign');
const { AddContactGroup, getContacts, getContactsById, deleteGroupContact } = require('../controllers/AddContacts');
const {getCampaignStats , getAllCampaignStats} = require('../controllers/getCampaignStats');
const getCampaignById = require('../controllers/GetCampaignById');
const uploadCSV = require('../controllers/uploadCSV');
const controller = require('../controllers/chatBotData');
const authController = require('../controllers/authController')
const botController = require('../controllers/chatBotStatus');
const ClientInfo = require('../controllers/ClientInfo');
const whatsappSessionController = require('../controllers/startController');
const whatsappChatsController = require('../controllers/WhatsAppChatController');

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
    router.post('/chatbot/save-keywords', controller.saveKeywordGroup);
    router.post('/chatbot/rules', controller.getAllChatbotRules);
    router.post('/chatbot/keywords', controller.getAllKeywordGroups);
    router.post('/chatbot-conversations', controller.getConversation);
    router.post('/chatbotStats', controller.getBotReplyStats);

    // Bot
    router.post('/bot/status', botController.setBotStatus);
    router.get('/bot/status', botController.getBotStatus);


        // WhatsApp Chats Routes
    router.post('/chats/history', whatsappChatsController.fetchChatHistory);
    router.post('/chats/contacts', whatsappChatsController.fetchAllContacts);
    router.post('/chats/send', whatsappChatsController.sendMessage);
    router.post('/chats/mark-read', whatsappChatsController.markAsRead);

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

    router.post('/session/init', async (req, res) => {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        try {
            const result = await whatsappSessionController.initOrGetSession(userId, req.app.get(io));
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to initialize session' });
        }
    });

    router.post('/session/status', (req, res) => {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const status = whatsappSessionController.getSessionStatus(userId);
        res.json(status);
    });

    router.post('/session/touch', async (req, res) => {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        try {
            await whatsappSessionController.touchSession(userId);
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ error: 'Failed to update session activity' });
        }
    });

    module.exports = router;
    return router;
};
