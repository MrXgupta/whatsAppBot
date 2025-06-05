require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes/Route');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
global.sessionManager = require('./Backup/whatsapp/sessionManager');
const initOrGetSession = require('./controllers/startController').initOrGetSession;

global.io = io;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', async (userId) => {
        if (!userId) {
            console.warn(`User ID missing for socket ${socket.id}`);
            return;
        }

        console.log(`Socket ${socket.id} joining room: ${userId}`);
        socket.join(userId.toString());

        const result = await initOrGetSession(userId, io);
        console.log(`Session status for ${userId}:`, result);
    });
});


app.use('/', routes(io));

server.listen(process.env.PORT || 5000, () => {
    console.log('Server running on' , process.env.PORT);
});