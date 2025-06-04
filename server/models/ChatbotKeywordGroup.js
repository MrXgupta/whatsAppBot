// Chatbot Keyword Group Schema
const mongoose = require("mongoose");
const chatbotKeywordGroupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupName: {
        type: String,
        required: true,
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

chatbotKeywordGroupSchema.index({ userId: 1 });
module.exports = mongoose.model('ChatbotKeywordGroup', chatbotKeywordGroupSchema);