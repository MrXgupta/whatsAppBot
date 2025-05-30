const { Client, LocalAuth } = require('whatsapp-web.js');
const ChatbotRule = require('../models/ChatBotRule');
const KeywordGroup = require('../models/ChatbotKeywordGroup');
const ChatbotConversation = require('../models/ChatbotConversation');

module.exports = (io, isClientReadyRef) => {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
    });

    let chatbotRules = [];
    let keywordGroups = [];
    const userContext = new Map();

    const loadChatbotRules = async () => {
        try {
            chatbotRules = await ChatbotRule.find({ isActive: true }).lean();
            console.log(`🤖 Loaded ${chatbotRules.length} chatbot rules`);
        } catch (err) {
            console.error('❌ Error loading chatbot rules:', err);
        }
    };

    const loadKeywordGroups = async () => {
        try {
            keywordGroups = await KeywordGroup.find({}).lean();
            console.log(`🔑 Loaded ${keywordGroups.length} keyword groups`);
        } catch (err) {
            console.error('❌ Error loading keyword groups:', err);
        }
    };

    client.on('qr', qr => {
        isClientReadyRef.value = false;
        io.emit('qr', qr);
    });

    client.on('ready', async () => {
        isClientReadyRef.value = true;
        io.emit('ready');
        console.log('✅ WhatsApp client is ready!');

        try {
            const info = client.info;
            if (!info?.wid?._serialized) return;

            let profilePicUrl = '';
            try {
                profilePicUrl = await client.getProfilePicUrl(info.wid._serialized);
            } catch {
                console.warn("Could not fetch profile picture.");
            }

            io.emit('client_info', {
                name: info.pushname || 'Unknown',
                number: info.wid.user,
                platform: info.platform,
                profilePicUrl,
            });

            await loadChatbotRules();
            await loadKeywordGroups();

        } catch (err) {
            console.error('❌ Failed to fetch client info:', err);
        }
    });

    client.on('auth_failure', msg => {
        isClientReadyRef.value = false;
        io.emit('auth_failure', msg);
        console.error('❌ Auth failure:', msg);
    });

    client.on('disconnected', reason => {
        isClientReadyRef.value = false;
        io.emit('disconnected', reason);
        console.log('⚠️ Disconnected:', reason);
    });


    // Chatbot Logic
    client.on('message', async message => {
        const incomingText = message.body.trim().toLowerCase();
        const from = message.from;

        if (from.includes('@newsletter') || from.includes('@broadcast')) {
            console.log(`Ignored system/broadcast message from ${from}`);
            return;
        }

        const chatbotRules = await ChatbotRule.find({ isActive: true });
        const keywordGroups = await KeywordGroup.find();

        const resolveKeyword = (ruleKeyword) => {
            if (!ruleKeyword || typeof ruleKeyword !== 'string') return [];

            const group = keywordGroups.find(
                k => k.groupName?.toLowerCase() === ruleKeyword.toLowerCase()
            );

            if (group) {
                return group.keywords.map(k => k.toLowerCase());
            }

            return [ruleKeyword.toLowerCase()];
        };



        let matchedRule = null;

        const lastRuleId = userContext.get(from);
        if (lastRuleId) {
            const childRules = chatbotRules.filter(r => r.parentRuleId?.toString() === lastRuleId.toString());

            for (const rule of childRules) {
                const ruleKeywords = resolveKeyword(rule.keyword);

                const matches = ruleKeywords.some(keyword => {
                    return (
                        (rule.matchType === 'exact' && incomingText === keyword) ||
                        (rule.matchType === 'contains' && incomingText.includes(keyword)) ||
                        (rule.matchType === 'startsWith' && incomingText.startsWith(keyword)) ||
                        (rule.matchType === 'endsWith' && incomingText.endsWith(keyword))
                    );
                });

                if (matches) {
                    matchedRule = rule;
                    break;
                }
            }

            if (matchedRule) {
                await message.reply(matchedRule.response);
                userContext.set(from, matchedRule._id);
                console.log(`🔁 Follow-up reply to '${from}' with: ${matchedRule.response}`);
                return;
            }
        }

        const rootRules = chatbotRules.filter(r => !r.parentRuleId);

        for (const rule of rootRules) {
            const ruleKeywords = resolveKeyword(rule.keyword);

            const matches = ruleKeywords.some(keyword => {
                return (
                    (rule.matchType === 'exact' && incomingText === keyword) ||
                    (rule.matchType === 'contains' && incomingText.includes(keyword)) ||
                    (rule.matchType === 'startsWith' && incomingText.startsWith(keyword)) ||
                    (rule.matchType === 'endsWith' && incomingText.endsWith(keyword))
                );
            });

            if (matches) {
                matchedRule = rule;
                break;
            }
        }

        if (matchedRule) {
            await message.reply(matchedRule.response);
            userContext.set(from, matchedRule._id);
            console.log(`🤖 Replied to '${from}' with: ${matchedRule.response}`);
            const normalizedFrom = from.split('@')[0];
            await ChatbotConversation.findOneAndUpdate(
                { number: normalizedFrom },
                {
                    $push: {
                        chats: {
                            query: incomingText,
                            response: matchedRule.response,
                            timestamp: new Date()
                        }
                    }
                },
                { upsert: true, new: true }
            );
        } else {
            console.log(`❌ No rule matched for: "${incomingText}" from ${from}`);
        }
    });

    client.initialize();
    return client;
};
