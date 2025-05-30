const mongoose = require('mongoose');

const chatbotRuleSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    matchType: {
        type: String,
        enum: ['exact', 'contains', 'startsWith', 'endsWith'],
        default: 'exact',
    },
    response: {
        type: String,
        required: true,
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatbotRule',
    }],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatbotRule',
        default: null,
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatbotKeywordGroup',
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
});

module.exports = mongoose.models.ChatbotRule || mongoose.model('ChatbotRule', chatbotRuleSchema);

