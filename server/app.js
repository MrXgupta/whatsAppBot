require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const routes = require('./routes/Route');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
global.sessionManager = require('./whatsapp/sessionManager');

// 🔁 Expose io globally for use in initClient during login
global.io = io;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    socket.on('join', (userId) => {
        if (!userId) {
            console.warn(`⚠️ User ID missing for socket ${socket.id}`);
            return;
        }

        console.log(`📡 Socket ${socket.id} joining room: ${userId}`);
        socket.join(userId.toString());
    });
});
// ✅ Routes
app.use('/', routes(io));

// ✅ Start server
server.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});
