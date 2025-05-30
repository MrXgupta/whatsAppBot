const mongoose = require('mongoose');

const ChatEntrySchema = new mongoose.Schema({
    query: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
});

const ChatbotConversationSchema = new mongoose.Schema({
    number: { type: String, unique: true },
    chats: [ChatEntrySchema]
});

module.exports = mongoose.model('ChatbotConversation', ChatbotConversationSchema);
