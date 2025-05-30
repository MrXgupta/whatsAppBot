require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes/Route');
const initClient = require('./whatsapp/initClient');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.urlencoded({ extended: true }));

const isClientReadyRef = { value: false };
global.clientInstance = initClient(io, isClientReadyRef);
app.use('/', routes(io, global.clientInstance, isClientReadyRef));


server.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
});
