const sessionManager = require('../whatsapp/sessionManager');

const ClientInfo = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(userId , "hehe")

        const session = sessionManager.getClient(userId);
        console.log("session", session)
        const client = session?.client;
        console.log("client" , client)

        console.log('[CHECK CLIENT]', userId, 'client?', !!client, 'client.info?', !!client?.info);

        if (!client || !client.info) {
            return res.status(404).json({ error: 'Client not initialized or not connected' });
        }

        const info = client.info;

        let profilePicUrl = '';
        try {
            profilePicUrl = await client.getProfilePicUrl(info.wid._serialized);
        } catch {
            profilePicUrl = '';
        }

        res.json({
            name: info.pushname || 'Unknown',
            number: info.wid.user,
            platform: info.platform,
            profilePicUrl,
        });

    } catch (err) {
        console.error('⚠️ Error fetching client info:', err.message);
        res.status(500).json({ error: 'Failed to fetch client info' });
    }
}

module.exports = ClientInfo;