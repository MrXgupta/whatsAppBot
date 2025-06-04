const WhatsappSession = require('../models/WhatsappSession');

const sessions = {};
const SESSION_TIMEOUT_MINUTES = 30;

const getClient = (userId) => sessions[userId.toString()]?.session;

const setClient = async (userId, sessionObj) => {

    sessions[userId.toString()] = {
        session: sessionObj,
        lastActiveAt: Date.now()
    };

    await WhatsappSession.findOneAndUpdate(
        { userId },
        { sessionData: {}, lastActiveAt: new Date() },
        { upsert: true, new: true }
    );
};

const hasClient = (userId) => {
    const stored = sessions[userId.toString()];
    if (!stored || !stored.session) return false;

    const inactiveTime = Date.now() - new Date(stored.lastActiveAt).getTime();
    const isTimedOut = inactiveTime > SESSION_TIMEOUT_MINUTES * 60 * 1000;

    if (isTimedOut) {
        delete sessions[userId.toString()];
        WhatsappSession.deleteOne({ userId }).catch(console.error);
        console.log(`Session for user ${userId} timed out and was deleted.`);
        return false;
    }
    return true;
};

const updateActivity = async (userId) => {
    if (sessions[userId.toString()]) {
        sessions[userId.toString()].lastActiveAt = Date.now();
        await WhatsappSession.findOneAndUpdate(
            { userId },
            { lastActiveAt: new Date() }
        );
    }
};

module.exports = {
    getClient,
    setClient,
    hasClient,
    updateActivity
};
