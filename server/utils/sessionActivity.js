const WhatsappSession = require('../models/WhatsappSession');

const touchSession = async (userId) => {
    if (!userId) return;

    try {
        await WhatsappSession.findOneAndUpdate(
            { userId },
            { lastActiveAt: new Date() },
            { upsert: true, new: true }
        );
    } catch (err) {
        console.error(`Failed to update activity for user ${userId}:`, err.message);
    }
};

module.exports = { touchSession };
