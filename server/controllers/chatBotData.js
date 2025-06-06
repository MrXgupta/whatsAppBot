const ChatbotRule = require('../models/ChatBotRule');
const ChatbotKeywordGroup = require('../models/ChatbotKeywordGroup');
const ChatbotConversation = require('../models/ChatbotConversation');
const {loadChatbotData} = require("./chatbotController");

// Saving the chat bot rules per user
exports.saveChatbotRule = async (req, res) => {
    try {
        const {userId, keyword, matchType = 'exact', response, parent, group} = req.body;
        if (!userId || !keyword || !response) return res.status(400).json({error: 'User ID, keyword, and response are required.'});

        const rule = new ChatbotRule({userId, keyword, matchType, response, parent, group});
        await rule.save();
        await loadChatbotData(userId);

        if (parent) {
            const parentRule = await ChatbotRule.findOne({_id: parent, userId});
            if (parentRule) {
                parentRule.children.push(rule._id);
                await parentRule.save();
            }
        }

        res.status(201).json({success: true, message: 'Rule created', rule});
    } catch (err) {
        console.error('❌ Error saving rule:', err);
        res.status(500).json({error: 'Internal server error.'});
    }
};

// Getting the all chatbot rules per user
exports.getAllChatbotRules = async (req, res) => {
    try {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'User ID is required.'});

        const rules = await ChatbotRule.find({userId})
            .populate('children')
            .populate('parent')
            .populate('group');
        await loadChatbotData(userId);
        res.status(200).json({success: true, rules});
    } catch (err) {
        console.error('❌ Error fetching rules:', err);
        res.status(500).json({error: 'Internal server error.'});
    }
};

// Saving the group of keywords for single res per user
exports.saveKeywordGroup = async (req, res) => {
    try {
        const {userId, groupName, keywords} = req.body;
        if (!userId || !groupName || !Array.isArray(keywords)) return res.status(400).json({error: 'User ID, group name, and keywords are required.'});

        const group = new ChatbotKeywordGroup({userId, groupName, keywords});
        await group.save();
        await loadChatbotData(userId);
        res.status(201).json({success: true, message: 'Keyword group created', group});
    } catch (err) {
        console.error('❌ Error saving group:', err);
        res.status(500).json({error: 'Internal server error.'});
    }
};

// getting the all chatbot keywords group per user
exports.getAllKeywordGroups = async (req, res) => {
    try {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'User ID is required.'});

        const groups = await ChatbotKeywordGroup.find({userId});
        await loadChatbotData(userId);
        res.status(200).json({success: true, groups});
    } catch (err) {
        console.error('❌ Error fetching keyword groups:', err);
        res.status(500).json({error: 'Internal server error.'});
    }
};

// ChatBot conversation basically tells what was the msg and what res triggered
exports.getConversation = async (req, res) => {
    try {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'User ID is required.'});

        const conversations = await ChatbotConversation.find({userId});

        const sorted = conversations.map(convo => {
            const sortedChats = [...convo.chats].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return {
                ...convo._doc,
                chats: sortedChats
            };
        });

        res.json({
            success: true,
            conversation: sorted
        });
    } catch (err) {
        console.error('Error fetching chatbot conversations:', err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

// get all the stats of chatbot like how many replies till now success count or failed count
exports.getBotReplyStats = async (req, res) => {
    try {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'User ID is required.'});

        const conversations = await ChatbotConversation.find({userId});

        let totalReplies = 0;
        let successCount = 0;
        let failedCount = 0;

        conversations.forEach(conv => {
            conv.chats.forEach(chat => {
                totalReplies++;
                if (chat.response && chat.response.length > 0) {
                    successCount++;
                } else {
                    failedCount++;
                }
            });
        });

        res.status(200).json({
            success: true,
            stats: {
                total: totalReplies,
                sent: successCount,
                failed: failedCount
            }
        });
    } catch (err) {
        console.error('Error fetching bot reply stats:', err);
        res.status(500).json({success: false, message: 'Internal server error'});
    }
};

