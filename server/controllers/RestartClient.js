module.exports = (client, isClientReadyRef) => async (req, res) => {
    try {
        isClientReadyRef.value = false;
        if (client) {
            await client.destroy();
        }
        setTimeout(() => {
            require('../whatsapp/initClient')(req.app.get('io'), isClientReadyRef);
        }, 2000);

        res.status(200).json({ success: true, message: 'Client restarted successfully.' });
    } catch (error) {
        console.error('Error during restart:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};