require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');
const routes = require('./routes/Route');
const {addUserSocket, removeUserSocket,} = require('./controllers/socketStore');
const app = express();
const server = http.createServer(app);
global.sessionManager = require('./Backup/whatsapp/sessionManager');
const initOrGetSession = require('./controllers/startController').initOrGetSession;

const allowedOrigins = [
    'http://localhost:5173',
    'https://alokcode.tech',
    'https://whats-app-bot-eta.vercel.app',
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow no origin (e.g., mobile apps or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn('Blocked by CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST']
    }
});

global.io = io;

app.set("io", io);

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`🟢 User ${userId} joined room ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});


app.use('/', routes(io));

server.listen(process.env.PORT || 5000, () => {
    console.log('Server running on', process.env.PORT);
});