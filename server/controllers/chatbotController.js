const ChatbotRule = require('../models/ChatbotRule');
const ChatbotKeywordGroup = require('../models/ChatbotKeywordGroup');
const ChatbotConversation = require('../models/ChatbotConversation');

exports.saveChatbotRule = async (req, res) => {
    try {
        const { keyword, matchType = 'exact', response, parent, group } = req.body;
        if (!keyword || !response) return res.status(400).json({ error: 'Keyword and response are required.' });

        const rule = new ChatbotRule({ keyword, matchType, response, parent, group });
        await rule.save();

        if (parent) {
            const parentRule = await ChatbotRule.findById(parent);
            if (parentRule) {
                parentRule.children.push(rule._id);
                await parentRule.save();
            }
        }

        res.status(201).json({ success: true, message: 'Rule created', rule });
    } catch (err) {
        console.error('❌ Error saving rule:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getAllChatbotRules = async (req, res) => {
    try {
        const rules = await ChatbotRule.find().populate('children').populate('parent').populate('group');
        res.status(200).json({ success: true, rules });
    } catch (err) {
        console.error('❌ Error fetching rules:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.saveKeywordGroup = async (req, res) => {
    try {
        const { groupName, keywords } = req.body;
        if (!groupName || !Array.isArray(keywords)) return res.status(400).json({ error: 'Group name and keywords are required.' });

        const group = new ChatbotKeywordGroup({ groupName, keywords });
        await group.save();

        res.status(201).json({ success: true, message: 'Keyword group created', group });
    } catch (err) {
        console.error('❌ Error saving group:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getAllKeywordGroups = async (req, res) => {
    try {
        const groups = await ChatbotKeywordGroup.find();
        res.status(200).json({ success: true, groups });
    } catch (err) {
        console.error('❌ Error fetching keyword groups:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const conversations = await ChatbotConversation.find({});

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