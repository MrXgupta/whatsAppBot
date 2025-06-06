const {sessions} = require('./startController');

// This function is responsible for the chat history of a contact connected wa
const fetchChatHistory = async (req, res) => {
    try {
        const {userId, contactNumber} = req.body;

        if (!userId || !contactNumber) {
            return res.status(400).json({
                success: false,
                error: 'User ID and contact number are required'
            });
        }

        const formattedNumber = contactNumber.toString().replace(/\D/g, '');

        if (!sessions.has(userId.toString())) {
            return res.status(400).json({
                success: false,
                error: 'No active WhatsApp session found'
            });
        }

        const session = sessions.get(userId.toString());

        if (session.status !== 'ready') {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp session is not ready'
            });
        }

        // Update last active time
        session.lastActive = Date.now();

        // Get chat with this contact
        const chat = await session.client.getChatById(`${formattedNumber}@c.us`);

        if (!chat) {
            return res.status(404).json({
                success: false,
                error: 'Chat not found with this contact'
            });
        }

        // Fetch last 100 messages (adjust limit as needed)
        const messages = await chat.fetchMessages({limit: 100});

        // Format messages for frontend consumption
        const formattedMessages = messages.map(msg => ({
            id: msg.id.id,
            fromMe: msg.fromMe,
            body: msg.body,
            timestamp: msg.timestamp * 1000, // Convert to milliseconds
            hasMedia: msg.hasMedia,
            type: msg.type,
            // Include other needed fields
        }));

        return res.status(200).json({
            success: true,
            contact: {
                id: chat.id.user,
                name: chat.name || chat.id.user,
                number: formattedNumber
            },
            messages: formattedMessages
        });

    } catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch chat history'
        });
    }
};

// This function will fetch all the contacts from client wa
const fetchAllContacts = async (req, res) => {
    try {
        const {userId} = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        // Check if user has an active session
        if (!sessions.has(userId.toString())) {
            return res.status(400).json({
                success: false,
                error: 'No active WhatsApp session found'
            });
        }

        const session = sessions.get(userId.toString());

        if (session.status !== 'ready') {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp session is not ready'
            });
        }

        // Update last active time
        session.lastActive = Date.now();

        // Fetch all chats
        const chats = await session.client.getChats();

        // Format chats/contacts for frontend
        const contacts = chats.map(chat => ({
            id: chat.id.user,
            name: chat.name || chat.id.user,
            lastMessage: chat.lastMessage ? {
                body: chat.lastMessage.body,
                timestamp: chat.lastMessage.timestamp * 1000,
                fromMe: chat.lastMessage.fromMe
            } : null,
            unreadCount: chat.unreadCount,
            isGroup: chat.isGroup,
            timestamp: chat.timestamp * 1000
        }));

        return res.status(200).json({
            success: true,
            contacts: contacts
        });

    } catch (error) {
        console.error('Error fetching contacts:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch contacts'
        });
    }
};

// This will send the message through frontend
const sendMessage = async (req, res) => {
    try {
        const {userId, contactNumber, message} = req.body;

        if (!userId || !contactNumber || !message) {
            return res.status(400).json({
                success: false,
                error: 'User ID, contact number, and message are required'
            });
        }

        // Convert to string and ensure consistent format
        const formattedNumber = contactNumber.toString().replace(/\D/g, '');

        // Check if user has an active session
        if (!sessions.has(userId.toString())) {
            return res.status(400).json({
                success: false,
                error: 'No active WhatsApp session found'
            });
        }

        const session = sessions.get(userId.toString());

        if (session.status !== 'ready') {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp session is not ready'
            });
        }

        // Update last active time
        session.lastActive = Date.now();

        // Send message to the contact
        const sentMessage = await session.client.sendMessage(`${formattedNumber}@c.us`, message);

        return res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            messageDetails: {
                id: sentMessage.id.id,
                timestamp: sentMessage.timestamp * 1000
            }
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
};

// This will send the mark as read to chat wa
const markAsRead = async (req, res) => {
    try {
        const {userId, contactNumber} = req.body;

        if (!userId || !contactNumber) {
            return res.status(400).json({
                success: false,
                error: 'User ID and contact number are required'
            });
        }

        // Check if user has an active session
        if (!sessions.has(userId.toString())) {
            return res.status(400).json({
                success: false,
                error: 'No active WhatsApp session found'
            });
        }

        const session = sessions.get(userId.toString());

        if (session.status !== 'ready') {
            return res.status(400).json({
                success: false,
                error: 'WhatsApp session is not ready'
            });
        }

        // Update last active time
        session.lastActive = Date.now();

        // Get chat with this contact
        const chat = await session.client.getChatById(`${contactNumber}@c.us`);

        if (!chat) {
            return res.status(404).json({
                success: false,
                error: 'Chat not found with this contact'
            });
        }

        // Mark chat as read
        await chat.sendSeen();

        return res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to mark messages as read'
        });
    }
};

module.exports = {
    fetchChatHistory,
    fetchAllContacts,
    sendMessage,
    markAsRead
};