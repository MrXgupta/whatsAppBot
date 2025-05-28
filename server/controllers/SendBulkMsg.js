const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const Message = require('../models/Messages');
const Contact = require('../models/Contact')
const isValidPhoneNumber = require('../utils/validators').isValidPhoneNumber;
const { MessageMedia } = require('whatsapp-web.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const SendBulkMsg = (client, io, isClientReadyRef) => {
    const handler = async (req, res) => {
        if (!isClientReadyRef.value) {
            return res.status(503).json({ error: 'WhatsApp client is not ready.' });
        }
        const { campaignId, message } = req.body;
        const minDelay = Number(req.body.minDelay);
        const maxDelay = Number(req.body.maxDelay);
        const mediaFile = req.file;

        if (!campaignId || !message) {
            return res.status(400).json({ error: 'Missing campaign ID or message.' });
        }

        try {
            const contacts = await Contact.find({ campaignId });
            const logs = { success: [], failed: [] };

            for (const contact of contacts) {
                try {
                    if (!isValidPhoneNumber(contact.number)) throw new Error('Invalid phone number');

                    const delayMs = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay) * 1000;
                    await delay(delayMs);

                    const chatId = contact.number.includes('@c.us') ? contact.number : `${contact.number}@c.us`;

                    if (mediaFile) {
                        const media = new MessageMedia(mediaFile.mimetype, mediaFile.buffer.toString('base64'), mediaFile.originalname);
                        await client.sendMessage(chatId, media, { caption: message });
                    } else {
                        await client.sendMessage(chatId, message);
                    }

                    logs.success.push(contact.number);
                    io.emit('log', { number: contact.number, status: 'success' });

                    await Message.create({
                        campaignId,
                        contactId: contact._id,
                        number: contact.number,
                        message,
                        status: 'success'
                    });

                } catch (err) {
                    logs.failed.push({ number: contact.number, error: err.message });
                    io.emit('log', { number: contact.number, status: 'failed', error: err.message });

                    await Message.create({
                        campaignId,
                        contactId: contact._id,
                        number: contact.number,
                        message,
                        status: 'failed',
                        error: err.message
                    });
                }
            }

            return res.json(logs);

        } catch (error) {
            console.error('Error while sending messages:', error);
            return res.status(500).json({ error: 'Server error while sending messages.'}, error);
        }
    };

    return [upload.single('media'), handler];
};

module.exports = SendBulkMsg;
