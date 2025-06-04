const sessionManager = require('../whatsapp/sessionManager');

exports.setBotStatus = (req, res) => {
    const { isActive, userId } = req.body;
    const session = sessionManager.getClient(userId);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    isActive ? session.resumeBot() : session.pauseBot();
    return res.json({ isActive, status: isActive ? 'resumed' : 'paused' });
};

exports.getBotStatus = (req, res) => {
    const { userId } = req.query;
    const session = sessionManager.getClient(userId);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ isActive: !session.isBotPaused() });
};