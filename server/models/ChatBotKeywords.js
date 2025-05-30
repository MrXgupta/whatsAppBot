const mongoose = require('mongoose');

const ChatbotKeywordSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
        trim: true,
    },
    response: {
        type: String,
        required: true,
    },
    matchType: {
        type: String,
        enum: ['exact', 'contains'],
        default: 'exact',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('ChatbotKeyword', ChatbotKeywordSchema);
