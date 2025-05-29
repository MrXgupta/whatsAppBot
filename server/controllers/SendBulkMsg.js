const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const Message = require('../models/Messages');
const ContactGroup = require('../models/Contact');
const Campaign = require('../models/Campaign');
const { MessageMedia } = require('whatsapp-web.js');
const isValidPhoneNumber = require('../utils/validators').isValidPhoneNumber;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const SendBulkMsg = (client, io, isClientReadyRef) => {
    const handler = async (req, res) => {
        console.log('💡 Received body:', req.body);
        const { campaignName, groupId, message, minDelay, maxDelay } = req.body;
        const mediaFile = req.file;

        if (!isClientReadyRef.value) {
            return res.status(503).json({ error: 'WhatsApp client is not ready.' });
        }

        if (!groupId || !message || !campaignName) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        try {
            const group = await ContactGroup.findById(groupId);
            if (!group || !Array.isArray(group.numbers) || group.numbers.length === 0) {
                return res.status(404).json({ error: 'No contacts found in the selected group.' });
            }

            const campaign = await Campaign.create({
                campaignName,
                groupId,
                groupName: group.groupName,
                message,
                totalContacts: group.numbers.length,
                status: 'running',
                sentAt: new Date(),
                logs: [],
            });

            for (let i = 0; i < group.numbers.length; i++) {
                const number = group.numbers[i];
                let status = 'success';
                let error = '';

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
                } catch (err) {
                    status = 'failed';
                    error = err.message;
                }

                campaign.logs.push({ number, status, error });
                io.emit('log', { number, status, error, progress: ((i + 1) / group.numbers.length) * 100 });
            }

            campaign.status = 'completed';
            await campaign.save();

            return res.status(200).json({ success: true, campaignId: campaign._id });
        } catch (err) {
            console.error('❌ Error in SendBulkMsg:', err);
            return res.status(500).json({ error: 'Server error while sending messages.' });
        }
    };

    return [upload.single('media'), handler];
};

module.exports = SendBulkMsg;