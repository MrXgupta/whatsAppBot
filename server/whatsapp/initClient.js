const { Client, LocalAuth } = require('whatsapp-web.js');

module.exports = (io, isClientReadyRef) => {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
    });

    client.on('qr', qr => {
        isClientReadyRef.value = false;
        io.emit('qr', qr);
    });

    client.on('ready', async () => {
        isClientReadyRef.value = true;

        io.emit('ready');
        console.log('WhatsApp client is ready!');

        try {
            const info = client.info;
            const profilePicUrl = await client.getProfilePicUrl(info.wid._serialized);

            io.emit('client_info', {
                name: info.pushname || 'Unknown',
                number: info.wid.user,
                platform: info.platform,
                profilePicUrl,
            });
        } catch (err) {
            console.error('Failed to fetch client info:', err);
        }
    });

    client.on('auth_failure', msg => {
        isClientReadyRef.value = false;
        io.emit('auth_failure', msg);
        console.error('Auth failure:', msg);
    });

    client.on('disconnected', reason => {
        isClientReadyRef.value = false;
        io.emit('disconnected', reason);
        console.log('Disconnected:', reason);
    });

    client.initialize();
    return client;
};


