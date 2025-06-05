const mongoose = require("mongoose");
const ContactGroupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    groupName: { type: String, required: true },
    numbers: [{ type: String }],
    validNumbers: [{ type: String }],
    invalidNumbers: [{ type: String }],
    duplicatesRemoved: { type: Number, default: 0 },
    validationStatus: { type: String, default: 'pending' },
    addedAt: { type: Date, default: Date.now }
});

ContactGroupSchema.index({ userId: 1 });
module.exports = mongoose.model('ContactGroup', ContactGroupSchema);
