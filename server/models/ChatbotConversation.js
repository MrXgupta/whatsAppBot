// Chatbot Conversation Schema
const mongoose = require("mongoose");
const ChatEntrySchema = new mongoose.Schema({
    query: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
});

const ChatbotConversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    number: { type: String },
    chats: [ChatEntrySchema]
});

ChatbotConversationSchema.index({ userId: 1 });
module.exports = mongoose.model('ChatbotConversation', ChatbotConversationSchema);
