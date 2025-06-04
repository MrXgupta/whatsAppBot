const { Client, LocalAuth } = require('whatsapp-web.js');
const ChatbotRule = require('../models/ChatBotRule');
const KeywordGroup = require('../models/ChatbotKeywordGroup');
const ChatbotConversation = require('../models/ChatbotConversation');
const {touchUserSession} = require("../utils/sessionActivity");

const createClient = (userId, io) => {
    const clientId = userId.toString().replace(/[^a-zA-Z0-9_-]/g, '');
    console.log(`🟢 Creating client for ${clientId}`);

    const client = new Client({
        authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth', clientId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        },
    });

    let isBotPaused = false;
    let userContext = new Map();
    let chatbotRules = [];
    let keywordGroups = [];

    const loadChatbotRules = async () => {
        chatbotRules = await ChatbotRule.find({ isActive: true }).lean();
    };

    const loadKeywordGroups = async () => {
        keywordGroups = await KeywordGroup.find({}).lean();
    };

    client.on('qr', (qr) => io.to(userId.toString()).emit('qr', qr));
    client.on('ready', async () => {
        io.to(userId.toString()).emit('ready');
        await loadChatbotRules();
        await loadKeywordGroups();
    });

    client.on('auth_failure', (msg) => io.to(userId.toString()).emit('auth_failure', msg));
    client.on('disconnected', (reason) => io.to(userId.toString()).emit('disconnected', reason));

    client.on('message', async (message) => {
        if (isBotPaused) return;
        const from = message.from;
        const incomingText = message.body.trim().toLowerCase();

        const resolveKeyword = (ruleKeyword) => {
            const group = keywordGroups.find(k => k.groupName?.toLowerCase() === ruleKeyword?.toLowerCase());
            return group ? group.keywords.map(k => k.toLowerCase()) : [ruleKeyword.toLowerCase()];
        };

        const lastRuleId = userContext.get(from);
        let matchedRule = null;

        if (lastRuleId) {
            const childRules = chatbotRules.filter(r => r.parentRuleId?.toString() === lastRuleId.toString());
            for (const rule of childRules) {
                const keywords = resolveKeyword(rule.keyword);
                if (keywords.some(k => incomingText.includes(k))) {
                    matchedRule = rule;
                    break;
                }
            }
        }

        if (!matchedRule) {
            const rootRules = chatbotRules.filter(r => !r.parentRuleId);
            for (const rule of rootRules) {
                const keywords = resolveKeyword(rule.keyword);
                if (keywords.some(k => incomingText.includes(k))) {
                    matchedRule = rule;
                    break;
                }
            }
        }

        if (matchedRule) {
            await touchUserSession(userId);
            await message.reply(matchedRule.response);
            userContext.set(from, matchedRule._id);
            const normalizedFrom = from.split('@')[0];
            await ChatbotConversation.findOneAndUpdate(
                { number: normalizedFrom },
                { $push: { chats: { query: incomingText, response: matchedRule.response, timestamp: new Date() } } },
                { upsert: true, new: true }
            );
        }
    });

    client.initialize();

    return {
        client,
        pauseBot: () => (isBotPaused = true),
        resumeBot: () => (isBotPaused = false),
        isBotPaused: () => isBotPaused
    };
};

module.exports = createClient;