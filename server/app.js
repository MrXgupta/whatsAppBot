require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes/Route');
const initClient = require('./whatsapp/initClient');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Shared state
const isClientReadyRef = { value: false };
let client = null;

// Initialize WhatsApp Client
client = initClient(io, isClientReadyRef);

// Load routes with dependencies
app.use('/', routes(io, client, isClientReadyRef));

server.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});

