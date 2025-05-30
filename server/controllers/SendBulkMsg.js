const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const Message = require('../models/ChatBotKeywords');
const ContactGroup = require('../models/Contact');
const Campaign = require('../models/Campaign');
const { MessageMedia } = require('whatsapp-web.js');
const isValidPhoneNumber = require('../utils/validators').isValidPhoneNumber;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const SendBulkMsg = (client, io, isClientReadyRef) => {
    const handler = async (req, res) => {
        const { campaignName, groupId, message, minDelay, maxDelay } = req.body;
        const mediaFile = req.file;
        console.log("media file " , mediaFile)

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

            // Filter valid numbers only
            const validNumbers = group.numbers.filter(isValidPhoneNumber);

            if (validNumbers.length === 0) {
                return res.status(400).json({ error: 'No valid phone numbers to send messages.' });
            }

            const campaign = await Campaign.create({
                campaignName,
                groupId,
                groupName: group.groupName,
                message,
                totalContacts: validNumbers.length,
                status: 'running',
                sentAt: new Date(),
                logs: [],
            });

            // Respond immediately
            res.status(200).json({ success: true, campaignId: campaign._id, total: validNumbers.length });

            // Background sending
            (async () => {
                for (let i = 0; i < validNumbers.length; i++) {
                    const number = validNumbers[i];
                    let status = 'success';
                    let error = '';

                    try {
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
                    io.emit('log', {
                        number,
                        status,
                        error,
                        progress: ((i + 1) / validNumbers.length) * 100,
                    });
                }

                campaign.status = 'completed';
                await campaign.save();
            })();

        } catch (err) {
            console.error('❌ Error in SendBulkMsg:', err);
            return res.status(500).json({ error: 'Server error while initiating campaign.' });
        }
    };

    return [upload.single('media'), handler];
};

module.exports = SendBulkMsg;
