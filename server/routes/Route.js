const express = require('express');
const sendBulkMsg = require('../controllers/SendBulkMsg');
const handleCsv = require('../controllers/HandleCsv');
const restartClient = require('../controllers/RestartClient');
const CreateCampaign = require('../controllers/CreateCampaign');
const AddContacts = require('../controllers/AddContacts');

module.exports = (io, client, isClientReadyRef) => {
    const router = express.Router();

    router.post('/send', sendBulkMsg(io, client, isClientReadyRef));
    router.post('/upload', handleCsv);
    router.post('/restart-client', restartClient(client, isClientReadyRef));
    router.post('/campaign', CreateCampaign);
    router.post('/contacts', AddContacts);

    return router;
};