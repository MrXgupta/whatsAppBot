const qrcode = require('qrcode-terminal');
const {Client, LocalAuth} = require('whatsapp-web.js');
const WhatsappSession = require('../models/WhatsappSession');
const path = require('path');
const fs = require('fs');
const {handleIncomingMessage, loadChatbotData} = require('../controllers/chatbotController');

const SESSION_TIMEOUT_MINUTES = 300;
const sessions = new Map();

// checking if the session is active or not
function _isSessionActive(session) {
    if (!session) return false;
    if (session.status !== 'ready' && session.status !== 'pending') return false;
    const inactiveMs = Date.now() - session.lastActive;
    return inactiveMs <= SESSION_TIMEOUT_MINUTES * 60 * 1000;
}

// destroy the session and del the session dir from .wwebjs_auth too
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
    }, 3000); // wait 3 seconds

    console.log(`Session for user ${userId} destroyed and DB entry deleted.`);
}

// reset time and if time out then destroy the session
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

// main function to connect the client, check if the session is available or not or create a new session
async function initOrGetSession(userId, io) {
    userId = userId.toString();
    console.log(`🟢 Initializing or getting session for user ${userId}`);

    if (sessions.has(userId)) {
        const session = sessions.get(userId);
        session.io = io;
        if (_isSessionActive(session)) {
            console.log(`🟢 Session for user ${userId} already active`);
            return {status: session.status};
        }
        await _destroySession(userId);
    }

    const clientId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
    const client = new Client({
        authStrategy: new LocalAuth({clientId, dataPath: './.wwebjs_auth'}),
        puppeteer: {
            headless: true,
            // executablePath: '/usr/bin/chromium',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        }
    });

    const session = {
        client,
        status: 'pending',
        lastActive: Date.now(),
        qr: null,
        timeoutId: null,
        io,
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
        await handleIncomingMessage(userId, message);

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

    client.on('auth_failure', (msg) => {
        console.log(`🟢 Auth failure for user ${userId}`);
        session.status = 'auth_failure';
        session.io?.to(userId).emit('auth_failure', msg);
        _destroySession(userId);
    });

    client.on('disconnected', (reason) => {
        console.log(`🟢 Disconnected: ${userId} =>`, reason);
        session.status = 'disconnected';
        session.io?.to(userId).emit('disconnected', reason);
        _destroySession(userId);
    });

    await client.initialize();
    console.log(`🟢 Session for user ${userId} initialized`);

    _resetTimeout(userId);

    return {status: session.status, message: 'Session initialized, waiting for QR'};
}

// checking if the session variable has the session or not if not the req to init will be sent again and the session will get stored
function getClient(userId) {
    return sessions.get(userId.toString());
}

// fetching the session status
function getSessionStatus(userId) {
    const session = sessions.get(userId.toString());
    if (!session) return {status: 'no_session'};
    return {
        status: session.status,
        qr: session.qr || null,
    };
}

// fetching the client
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

// this will fetch the raw session
function __getRawSession(userId) {
    userId = userId.toString();
    return sessions.get(userId);
}

module.exports = {
    initOrGetSession,
    getClient,
    getSessionStatus,
    __getRawSession,
    hasClient,
    sessions,
};