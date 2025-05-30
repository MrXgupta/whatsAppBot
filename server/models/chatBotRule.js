const mongoose = require('mongoose');

const chatbotRuleSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    matchType: {
        type: String,
        enum: ['exact', 'contains', 'startsWith', 'endsWith'],
        default: 'exact'
    },
    response: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('ChatbotRule', chatbotRuleSchema);
