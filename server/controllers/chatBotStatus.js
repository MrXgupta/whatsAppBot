const sessionManager = require('../controllers/startController');

// ✅ Pause/Resume Bot for a specific user
exports.setBotStatus = (req, res) => {
    const {isActive, userId} = req.body;
    const session = sessionManager.getClient(userId);

    if (!session) {
        return res.status(404).json({error: 'Session not found'});
    }

    if (typeof session.pauseBot !== 'function' || typeof session.resumeBot !== 'function') {
        return res.status(500).json({error: 'Bot control functions not available on session'});
    }

    if (isActive) {
        session.resumeBot();
    } else {
        session.pauseBot();
    }

    return res.json({isActive, status: isActive ? 'resumed' : 'paused'});
};

// ✅ Get Bot Status
exports.getBotStatus = (req, res) => {
    const {userId} = req.query;
    const session = sessionManager.getClient(userId);

    if (!session) {
        return res.status(404).json({error: 'Session not found'});
    }

    const isActive = !session.isBotPaused?.();
    res.json({isActive});
};
