const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
    number: String,
    message: String,
    status: { type: String, enum: ['success', 'failed'] },
    error: String,
    sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);