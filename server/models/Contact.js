const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: String,
    number: { type: String, required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    tags: [String],
    addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', ContactSchema);