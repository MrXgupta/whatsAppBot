const ChatbotKeyword = require('../models/ChatBotKeywords');

const addOrUpdateKeyword = async (req, res) => {
    try {
        const { keyword, response, matchType, isActive } = req.body;

        if (!keyword || !response) {
            return res.status(400).json({ error: 'Keyword and response are required.' });
        }

        const existing = await ChatbotKeyword.findOne({ keyword });

        if (existing) {
            existing.response = response;
            existing.matchType = matchType || 'exact';
            existing.isActive = typeof isActive === 'boolean' ? isActive : true;
            await existing.save();
            return res.status(200).json({ success: true, message: 'Keyword updated.' });
        }

        await ChatbotKeyword.create({ keyword, response, matchType, isActive });
        res.status(201).json({ success: true, message: 'Keyword added.' });

    } catch (err) {
        console.error('❌ Error adding keyword:', err);
        res.status(500).json({ error: 'Server error while adding keyword.' });
    }
};

const getAllKeywords = async (req, res) => {
    try {
        const keywords = await ChatbotKeyword.find().sort({ addedAt: -1 });
        res.status(200).json({ success: true, keywords });
    } catch (err) {
        console.error('❌ Error fetching keywords:', err);
        res.status(500).json({ error: 'Failed to fetch keywords.' });
    }
};

module.exports = {
    addOrUpdateKeyword,
    getAllKeywords
};
