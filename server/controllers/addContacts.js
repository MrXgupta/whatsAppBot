const Contact = require('../models/Contact');

const AddContacts = async (req, res) => {
    try {
        const { campaignId, contacts } = req.body;
        if (!campaignId || !Array.isArray(contacts)) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const insertedContacts = await Contact.insertMany(
            contacts.map(c => ({ ...c, campaignId }))
        );

        res.status(201).json({ success: true, contacts: insertedContacts });
    } catch (error) {
        res.status(500).json({ error: 'Error saving contacts.' });
    }
};

module.exports = AddContacts;
