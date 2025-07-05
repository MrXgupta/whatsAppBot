const express = require('express');
const sendBulkMsg = require('../controllers/SendBulkMsg');
const handleCsv = require('../controllers/HandleCsv');
const {CreateCampaign, deleteCampaign} = require('../controllers/createCampaign');
const {
    AddContactGroup,
    getContacts,
    getContactsById,
    deleteGroupContact,
    exportValidatedContacts,
    getContactGroupsSummary
} = require('../controllers/addContacts');
const {getCampaignStats, getAllCampaignStats} = require('../controllers/getCampaignStats');
const getCampaignById = require('../controllers/GetCampaignById');
const uploadCSV = require('../controllers/uploadCSV');
const controller = require('../controllers/chatBotData');
const botController = require('../controllers/chatBotStatus');
const ClientInfo = require('../controllers/clientInfo');
const whatsappSessionController = require('../controllers/startController');
const whatsappChatsController = require('../controllers/WhatsAppChatController');
const authController = require('../controllers/authController');
const session = require('../controllers/startController').sessions;

module.exports = (io) => {
    const router = express.Router();

    // Auth Routes
    router.post("/signup", authController.signup);
    router.post("/login", authController.login);

    // Bulk Messaging
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
    router.post('/getContactsSummary', getContactGroupsSummary);
    router.delete('/contacts/:id/:userId', deleteGroupContact);
    router.get('/contacts/:id', getContactsById);
    router.get('/contacts/export/:id', exportValidatedContacts);
    router.post('/upload-csv', uploadCSV);

    // Chatbot
    router.post('/chatbot/save-rules', controller.saveChatbotRule);
    router.post('/chatbot/save-keywords', controller.saveKeywordGroup);
    router.post('/chatbot/rules', controller.getAllChatbotRules);
    router.post('/chatbot/keywords', controller.getAllKeywordGroups);
    router.post('/chatbot-conversations', controller.getConversation);
    router.post('/chatbotStats', controller.getBotReplyStats);

    // Bot Control
    router.post('/bot/status', botController.setBotStatus);
    router.get('/bot/status', botController.getBotStatus);

    // WhatsApp Chats
    router.post('/chats/history', whatsappChatsController.fetchChatHistory);
    router.post('/chats/contacts', whatsappChatsController.fetchAllContacts);
    router.post('/chats/send', whatsappChatsController.sendMessage);
    router.post('/chats/mark-read', whatsappChatsController.markAsRead);

    // WhatsApp Info
    router.post('/client-info', ClientInfo);

    // Logout (safe destroy)
    router.post('/logout', async (req, res) => {
        try {
            const {userId} = req.body;
            if (!userId) {
                return res.status(400).json({error: 'userId is required'});
            }

            const startController = require('../controllers/startController');
            const rawSession = startController.__getRawSession(userId);

            if (!rawSession || !rawSession.client) {
                return res.status(404).json({error: 'WhatsApp client session not found.'});
            }

            const client = rawSession.client;

            console.log(`[LOGOUT] Logging out client for user ${userId}`);

            await client.logout();
            await client.destroy();

            // Remove the session from memory
            startController.sessions.delete(userId);

            res.json({success: true});
        } catch (err) {
            console.error("Logout error:", err);
            res.status(500).json({error: "Logout failed."});
        }
    });


    // WhatsApp Session Init
    router.post('/session/init', async (req, res) => {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'userId is required'});

        const ioInstance = req.app.get("io");

        try {
            const result = await whatsappSessionController.initOrGetSession(userId, ioInstance);
            res.json(result);
        } catch (e) {
            console.error(e);
            res.status(500).json({error: 'Failed to initialize session'});
        }
    });

    router.post('/session/status', (req, res) => {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'userId is required'});

        const status = whatsappSessionController.getSessionStatus(userId);
        res.json(status);
    });

    router.post('/session/touch', async (req, res) => {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'userId is required'});

        try {
            await whatsappSessionController.touchSession(userId);
            res.json({success: true});
        } catch (e) {
            res.status(500).json({error: 'Failed to update session activity'});
        }
    });

    return router;
};