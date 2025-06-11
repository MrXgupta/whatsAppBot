const qrcode = require('qrcode-terminal');
const {Client, LocalAuth} = require('whatsapp-web.js');
const WhatsappSession = require('../models/WhatsappSession');
const path = require('path');
const fs = require('fs');
const {handleIncomingMessage, loadChatbotData} = require('../controllers/chatbotController');

const SESSION_TIMEOUT_MINUTES = 3000;
const sessions = new Map();


function _isSessionActive(session) {
    if (!session) return false;
    if (session.status !== 'ready' && session.status !== 'pending') return false;
    const inactiveMs = Date.now() - session.lastActive;
    return inactiveMs <= SESSION_TIMEOUT_MINUTES * 60 * 1000;
}

async function _destroySession(userId) {
    userId = userId.toString();

    if (!sessions.has(userId)) return;

    const session = sessions.get(userId);
    clearTimeout(session.timeoutId);

    try {
        await session.client.destroy();
    } catch (e) {
        console.warn(`Failed to destroy client for ${userId}`, e.message);
    }

    sessions.delete(userId);
    await WhatsappSession.deleteOne({userId});

    setTimeout(() => {
        try {
            const clientId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
            const authPath = path.join('./.wwebjs_auth', `session-${clientId}`);
            fs.rm(authPath, {recursive: true, force: true}, (err) => {
                if (err) {
                    console.error(`Failed to delete auth folder for ${userId}:`, err.message);
                } else {
                    console.log(`Auth folder for user ${userId} deleted.`);
                }
            });
        } catch (e) {
            console.error(`Error deleting auth folder for ${userId}:`, e.message);
        }
    }, 3000);

    console.log(`Session for user ${userId} destroyed and DB entry deleted.`);
}

function _resetTimeout(userId) {
    userId = userId.toString();
    const session = sessions.get(userId);
    if (!session) return;

    if (session.timeoutId) clearTimeout(session.timeoutId);
    session.timeoutId = setTimeout(() => {
        _destroySession(userId);
        console.log(`Session for user ${userId} timed out and destroyed.`);
    }, SESSION_TIMEOUT_MINUTES * 60 * 1000);
}

async function initOrGetSession(userId, io) {
    userId = userId.toString();
    console.log(`🟢 Initializing or getting session for user ${userId}`);

    if (sessions.has(userId)) {
        const session = sessions.get(userId);

        // 🔒 Prevent duplicate init
        if (session.initializing) {
            console.log(`⚠️ Session for user ${userId} is already initializing.`);
            return {status: session.status};
        }

        session.io = io;

        if (_isSessionActive(session)) {
            console.log(`🟢 Session for user ${userId} already active`);
            return {status: session.status};
        }

        await _destroySession(userId); // Only destroy if inactive
    }


    const authPath = path.join('./.wwebjs_auth', `session-${clientId}`);
    const lockFile = path.join(authPath, 'SingletonLock');

    if (fs.existsSync(lockFile)) {
        try {
            fs.unlinkSync(lockFile);
            console.log(`🔓 Removed stale SingletonLock for user ${userId}`);
        } catch (e) {
            console.warn(`⚠️ Failed to remove SingletonLock for ${userId}:`, e.message);
        }
    }


    const clientId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
    const client = new Client({
        authStrategy: new LocalAuth({clientId, dataPath: './.wwebjs_auth'}),
        puppeteer: {
            headless: true,
            executablePath: '/usr/bin/chromium-browser',
            userDataDir: `./.wwebjs_user_data/${clientId}`,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        }
    });

    const session = {
        client,
        status: 'pending',
        initializing: true,
        lastActive: Date.now(),
        qr: null,
        timeoutId: null,
        io,
        botPaused: false,
        pauseBot: () => {
            session.botPaused = true;
        },
        resumeBot: () => {
            session.botPaused = false;
        },
        isBotPaused: () => session.botPaused
    };

    sessions.set(userId, session);

    client.on('qr', (qr) => {
        console.log(`🟢 QR received for user ${userId}`);
        try {
            qrcode.generate(qr, {small: true});
        } catch {
            console.log('\n📲 Scan the QR code below:\n', qr);
        }
        session.io?.to(userId).emit('qr', qr);
        session.qr = qr;
        session.status = 'pending';
        _resetTimeout(userId);
    });

    client.on('ready', async () => {
        console.log(`🟢 Session for user ${userId} is ready`);
        session.initializing = false;
        session.status = 'ready';
        session.qr = null;
        session.lastActive = Date.now();
        session.io?.to(userId).emit('ready');
        _resetTimeout(userId);
        await loadChatbotData(userId);
        await WhatsappSession.findOneAndUpdate(
            {userId},
            {sessionData: {}, lastActiveAt: new Date()},
            {upsert: true, new: true}
        );
    });

    client.on('message', async (message) => {
        if (session.status !== 'ready') return;
        if (session.isBotPaused()) {
            console.log(`🤖 Bot is paused for user ${userId}, message ignored.`);
            return;
        }
        await handleIncomingMessage(client, userId, message);

        if (!message.fromMe) {
            session.io?.to(userId).emit('new-message', {
                userId: userId,
                id: message.id.id,
                from: message.from.split('@')[0],
                fromName: message.notifyName || message.from.split('@')[0],
                body: message.body,
                timestamp: message.timestamp * 1000,
            });
        }
    });

    client.on('auth_failure', async (msg) => {
        console.log(`❌ Auth failure for user ${userId}`);
        session.initializing = false;
        session.status = 'auth_failure';
        session.io?.to(userId).emit('auth_failure', msg);
        await _destroySession(userId);
    });

    client.on('disconnected', async (reason) => {
        console.log(`🟠 Disconnected: ${userId} =>`, reason);
        session.initializing = false;
        session.status = 'disconnected';
        session.io?.to(userId).emit('disconnected', reason);
        await _destroySession(userId);
    });

    setTimeout(() => {
        if (session.status === 'pending') {
            console.log(`⏱️ QR timeout for ${userId}, reinitializing...`);
            client.destroy().then(() => {
                fs.rmSync(`.wwebjs_auth/session-${clientId}`, {recursive: true, force: true});
                sessions.delete(userId);
                initOrGetSession(userId, io);
            }).catch(err => console.error(`⚠️ Failed to destroy on QR timeout:`, err));
        }
    }, 30000);

    await client.initialize();
    console.log(`🟢 Session for user ${userId} initialized`);

    _resetTimeout(userId);
    return {status: session.status, message: 'Session initialized, waiting for QR'};
}

function getClient(userId) {
    return sessions.get(userId.toString());
}

function getSessionStatus(userId) {
    const session = sessions.get(userId.toString());
    if (!session) return {status: 'no_session'};
    return {
        status: session.status,
        qr: session.qr || null
    };
}

function hasClient(userId) {
    const session = sessions.get(userId.toString());
    if (!session || !session.client) return false;
    const inactiveTime = Date.now() - session.lastActive;
    const isTimedOut = inactiveTime > SESSION_TIMEOUT_MINUTES * 60 * 1000;
    if (isTimedOut) {
        sessions.delete(userId.toString());
        WhatsappSession.deleteOne({userId}).catch(console.error);
        console.log(`Session for user ${userId} timed out and was deleted.`);
        return false;
    }
    return true;
}

function __getRawSession(userId) {
    return sessions.get(userId.toString());
}

module.exports = {
    initOrGetSession,
    getClient,
    getSessionStatus,
    __getRawSession,
    hasClient,
    sessions,
};