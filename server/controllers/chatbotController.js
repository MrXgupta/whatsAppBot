const ChatbotRule = require('../models/ChatBotRule');
const ChatbotKeyword = require('../models/ChatbotKeywordGroup');
const ChatbotConversation = require('../models/ChatbotConversation');

const userContextMap = new Map();
const cache = new Map();

// This will load the rules and the keywords from the db this will trigger while saving the rules and keywords and on client Ready
const loadChatbotData = async (userId) => {
    const rules = await ChatbotRule.find({userId});
    const keywordGroups = await ChatbotKeyword.find({userId});
    cache.set(userId, {rules, keywordGroups});
}

// This function is find the rule and trigger the res
const resolveKeyword = (ruleKeyword, keywordGroups) => {
    const group = keywordGroups.find(k => k.groupName?.toLowerCase() === ruleKeyword?.toLowerCase());
    return group ? group.keywords.map(k => k.toLowerCase()) : [ruleKeyword.toLowerCase()];
}

// This function is responsible to send messages to contacts, it will receive and send res automatically
const handleIncomingMessage = async (client, userId, message) => {
    console.log("Chatbot Connected for", userId);

    // Ignore groups, broadcasts, status, or invalid chats
    if (
        message.from.includes('g.us') ||
        message.from.includes('broadcast') ||
        message.from.includes('status') ||
        !message.from.includes('c.us')
    ) {
        return;
    }

    // Load chatbot data into memory cache if not already
    if (!cache.has(userId)) await loadChatbotData(userId);

    console.log(`Message from ${message.from}: ${message.body}`);

    const {rules: chatbotRules, keywordGroups} = cache.get(userId);
    const from = message.from;
    const incomingText = message.body.trim().toLowerCase();

    const userMap = userContextMap.get(userId) || new Map();
    const lastRuleId = userMap.get(from);
    let matchedRule = null;

    const matchRules = (rulesToCheck) => {
        for (const rule of rulesToCheck) {
            const keywords = resolveKeyword(rule.keyword, keywordGroups);
            if (keywords.some(k => incomingText.includes(k))) {
                return rule;
            }
        }
        return null;
    };

    // Check for child rules if there's a previous context
    if (lastRuleId) {
        const childRules = chatbotRules.filter(r => r.parentRuleId?.toString() === lastRuleId.toString());
        matchedRule = matchRules(childRules);
    }

    // Otherwise, check root rules
    if (!matchedRule) {
        const rootRules = chatbotRules.filter(r => !r.parentRuleId);
        matchedRule = matchRules(rootRules);
    }

    // If a rule matched, send the response and update context
    if (matchedRule) {
        try {
            // Use client.sendMessage directly (safer than reply)
            await client.sendMessage(from, matchedRule.response);
        } catch (err) {
            console.warn("❌ Failed to send message:", err.message);
        }

        userMap.set(from, matchedRule._id);
        userContextMap.set(userId, userMap);

        // Log the interaction in database
        await ChatbotConversation.findOneAndUpdate(
            {number: from.split('@')[0], userId},
            {
                $push: {
                    chats: {
                        query: incomingText,
                        response: matchedRule.response,
                        timestamp: new Date()
                    }
                }
            },
            {upsert: true, new: true}
        );
    }
};

module.exports = {
    handleIncomingMessage,
    loadChatbotData
};
