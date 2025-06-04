const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaignName: { type: String, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContactGroup', required: true },
    groupName: { type: String },
    message: { type: String },
    totalContacts: { type: Number },
    sentAt: { type: Date },
    status: { type: String, enum: ['pending', 'running', 'completed'], default: 'pending' },
    logs: [
        {
            number: String,
            status: { type: String, enum: ['success', 'failed'] },
            error: String,
        },
    ],
    addedAt: { type: Date, default: Date.now }
});

CampaignSchema.index({ userId: 1 });
module.exports = mongoose.model('Campaign', CampaignSchema);