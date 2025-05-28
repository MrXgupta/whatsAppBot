const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const Message = require('../models/Messages');
const ContactGroup = require('../models/Contact');
const isValidPhoneNumber = require('../utils/validators').isValidPhoneNumber;
const { MessageMedia } = require('whatsapp-web.js');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SendBulkMsg = (client, io, isClientReadyRef) => {
    const handler = async (req, res) => {
        const { campaignId, message, minDelay, maxDelay } = req.body;
        const mediaFile = req.file;

        if (!isClientReadyRef.value) {
            return res.status(503).json({ error: 'WhatsApp client is not ready.' });
        }

        if (!campaignId || !message) {
            return res.status(400).json({ error: 'Missing campaign ID or message.' });
        }

        if (isNaN(minDelay) || isNaN(maxDelay) || minDelay < 0 || maxDelay < minDelay) {
            return res.status(400).json({ error: 'Invalid delay configuration.' });
        }

        try {
            const group = await ContactGroup.findById(campaignId);
            if (!group || !Array.isArray(group.numbers) || group.numbers.length === 0) {
                return res.status(404).json({ error: 'No contacts found in the selected group.' });
            }

            const logs = { success: [], failed: [] };

            for (const number of group.numbers) {
                try {
                    if (!isValidPhoneNumber(number)) throw new Error('Invalid phone number');

                    const delayMs = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay) * 1000;
                    await delay(delayMs);

                    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;

                    if (mediaFile) {
                        const media = new MessageMedia(
                            mediaFile.mimetype,
                            mediaFile.buffer.toString('base64'),
                            mediaFile.originalname
                        );
                        await client.sendMessage(chatId, media, { caption: message });
                    } else {
                        await client.sendMessage(chatId, message);
                    }

                    logs.success.push(number);
                    io.emit('log', { number, status: 'success' });

                    await Message.create({
                        campaignId,
                        number,
                        message,
                        status: 'success'
                    });
                } catch (err) {
                    logs.failed.push({ number, error: err.message });
                    io.emit('log', { number, status: 'failed', error: err.message });

                    await Message.create({
                        campaignId,
                        number,
                        message,
                        status: 'failed',
                        error: err.message
                    });
                }
            }

            return res.status(200).json(logs);
        } catch (error) {
            console.error('❌ Server Error:', error);
            return res.status(500).json({ error: 'Server error while sending messages.' });
        }
    };

    return [upload.single('media'), handler];
};

module.exports = SendBulkMsg;
