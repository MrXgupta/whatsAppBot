const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

let client;
let isClientReady = false;
let isRestarting = false;

function isValidPhoneNumber(number) {
    const cleaned = number.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}


function initClient() {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
    });

    client.on('qr', (qr) => {
        console.log('QR Code generated');
        isClientReady = false;
        io.emit('qr', qr);
    });

    client.on('ready', () => {
        console.log('WhatsApp client is ready!');
        isClientReady = true;
        io.emit('ready');
    });

    client.on('auth_failure', (msg) => {
        console.error('Authentication failure:', msg);
        isClientReady = false;
        io.emit('auth_failure', msg);
    });

    client.on('disconnected', (reason) => {
        console.log('Client disconnected:', reason);
        isClientReady = false;
        io.emit('disconnected', reason);
    });

    client.initialize();
}

async function restartWhatsAppClient() {
    if (isRestarting) {
        console.log('Restart already in progress...');
        return;
    }

    try {
        console.log('Restarting WhatsApp client...');
        isRestarting = true;

        if (client) {
            await client.destroy();
            client = null;
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        initClient();
    } catch (err) {
        console.error('⚠️ Error during WhatsApp client restart:', err);
        throw new Error('Failed to restart WhatsApp client');
    } finally {
        isRestarting = false;
    }
}

initClient();

app.post('/restart-client', async (req, res) => {
    try {
        await restartWhatsAppClient();
        res.status(200).json({ success: true, message: 'Client restarted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filePath = path.join(__dirname, req.file.path);
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
            if (data.number) results.push(data.number.trim());
        })
        .on('end', () => {
            fs.unlinkSync(filePath); // cleanup file
            const validNumbers = results.filter(isValidPhoneNumber);
            const invalidNumbers = results.filter(num => !isValidPhoneNumber(num));
            res.json({ validNumbers, invalidNumbers });
        })
        .on('error', (err) => {
            fs.unlinkSync(filePath);
            console.error('CSV parse error:', err);
            res.status(500).json({ error: 'Failed to parse CSV file.' });
        });
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.post('/send', async (req, res) => {
    if (!isClientReady) {
        return res.status(503).json({ error: 'WhatsApp client is not ready.' });
    }

    const { numbers, message } = req.body;
    const minDelay = Number(req.body.minDelay);
    const maxDelay = Number(req.body.maxDelay);


    if (!Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ error: 'No numbers provided.' });
    }

    if (typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const logs = { success: [], failed: [] };

    for (const num of numbers) {
        try {
            if (!isValidPhoneNumber(num)) {
                throw new Error('Invalid phone number format');
            }
            const chatId = num.includes('@c.us') ? num : `${num}@c.us`;
            await client.sendMessage(chatId, message);
            logs.success.push(num);
            io.emit('log', { number: num, status: 'success' });
        } catch (err) {
            logs.failed.push({ number: num, error: err.message });
            io.emit('log', { number: num, status: 'failed', error: err.message });
        }

        const delayMs = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay) * 1000;
        await delay(delayMs);
    }

    res.json(logs);
});


server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
