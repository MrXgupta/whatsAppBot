const mongoose = require('mongoose');

const ContactGroupSchema = new mongoose.Schema({
    groupName: { type: String, required: true, unique: true },
    numbers: [{ type: String }],
    validNumbers: [{ type: String }],
    invalidNumbers: [{ type: String }],
    validationStatus: { type: String, default: 'pending' },
    addedAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('ContactGroup', ContactGroupSchema);
