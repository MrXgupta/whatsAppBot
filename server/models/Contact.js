const mongoose = require('mongoose');

const ContactGroupSchema = new mongoose.Schema({
    groupName: { type: String, required: true, unique: true },
    numbers: [{ type: String }],
    addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactGroup', ContactGroupSchema);
