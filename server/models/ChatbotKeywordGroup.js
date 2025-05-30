const mongoose = require('mongoose');

const chatbotKeywordGroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    keywords: {
        type: [String],
        required: true,
        validate: v => Array.isArray(v) && v.length > 0,
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

module.exports = mongoose.model('ChatbotKeywordGroup', chatbotKeywordGroupSchema);
