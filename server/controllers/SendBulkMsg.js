const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage});
const ContactGroup = require('../models/Contact');
const Campaign = require('../models/Campaign');
const {MessageMedia} = require('whatsapp-web.js');
const {isValidPhoneNumber} = require('../utils/validators');
const {touchSession} = require('../utils/sessionActivity');
const {getSessionStatus} = require('../controllers/startController');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// This function is responsible to run campaigns it will send messages to the given contact groups at a time interval
const SendBulkMsg = (io) => {
    const handler = async (req, res) => {
        let {campaignName, groupId, message, minDelay, maxDelay, userId} = req.body;

        if (!userId || !groupId || !message || !campaignName) {
            return res.status(400).json({error: 'Missing required fields.'});
        }

        const {status} = getSessionStatus(userId);
        if (status !== 'ready') {
            return res.status(400).json({error: 'WhatsApp session not ready or expired.'});
        }

        const session = require('../controllers/startController').__getRawSession(userId);
        const userClient = session?.client;

        if (!userClient || !userClient.info?.wid?.user) {
            return res.status(400).json({error: 'Client is not ready yet.'});
        }

        if (!userClient.pupPage) {
            console.error(`[${userId}] Puppeteer page not ready`);
            return res.status(500).json({error: 'Puppeteer page not initialized. Try restarting session.'});
        }

        minDelay = Math.max(1, Number(minDelay) || 30);
        maxDelay = Math.max(minDelay, Number(maxDelay) || minDelay + 45);
        const mediaFile = req.file;

        try {
            const group = await ContactGroup.findOne({_id: groupId, userId});

            if (!group || !Array.isArray(group.numbers) || group.numbers.length === 0) {
                return res.status(404).json({error: 'No contacts found in the selected group.'});
            }

            const validNumbers = group.numbers.filter(isValidPhoneNumber);

            if (validNumbers.length === 0) {
                return res.status(400).json({error: 'No valid phone numbers to send messages.'});
            }

            const campaign = await Campaign.create({
                userId,
                campaignName,
                groupId,
                groupName: group.groupName,
                message,
                totalContacts: validNumbers.length,
                status: 'running',
                sentAt: new Date(),
                logs: [],
            });

            res.status(200).json({success: true, campaignId: campaign._id, total: validNumbers.length});

            // Async messaging
            (async () => {
                for (let i = 0; i < validNumbers.length; i++) {
                    touchSession(userId);

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
                            await userClient.sendMessage(chatId, media, {caption: message});
                        } else {
                            await userClient.sendMessage(chatId, message);
                        }
                    } catch (err) {
                        status = 'failed';
                        error = err.message;
                    }

                    campaign.logs.push({number, status, error});
                    io.emit('log', {
                        number,
                        status,
                        error,
                        progress: ((i + 1) / validNumbers.length) * 100,
                        campaignId: campaign._id
                    });
                }

                campaign.status = 'completed';
                await campaign.save();
            })();

        } catch (err) {
            console.error('SendBulkMsg Error:', err);
            return res.status(500).json({error: 'Server error while initiating campaign.'});
        }
    };

    return [upload.single('media'), handler];
};

module.exports = SendBulkMsg;
