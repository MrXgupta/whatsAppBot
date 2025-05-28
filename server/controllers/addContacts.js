const Contacts = require('../models/Contact');

const AddContactGroup = async (req, res) => {
    try {
        const { groupName, numbers } = req.body;
        console.log('Adding contact group:', groupName, numbers);

        if (!groupName || !Array.isArray(numbers) || numbers.length === 0) {
            return res.status(400).json({ error: 'Group name and number list are required.' });
        }

        const existing = await Contacts.findOne({ groupName });
        if (existing) {
            return res.status(400).json({ error: 'Group name already exists.' });
        }

        const group = await Contacts.create({
            groupName,
            numbers,
        });

        res.status(201).json({ success: true, group });
    } catch (error) {
        console.error('Error saving contact group:', error);
        res.status(500).json({ error: 'Failed to save contact group.' });
    }
};

const getContacts = async (req, res) => {
    try {
        const groups = await Contacts.find();
        res.status(200).json({ success: true, groups });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts.' });
    }
};

const getContactsById = async (req, res) => {
    const { id } = req.params;

    try {
        const group = await Contacts.findById(id);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (err) {
        console.error('❌ Error fetching group by ID:', err);
        res.status(500).json({ error: 'Failed to get the details' });
    }
};



module.exports = {AddContactGroup , getContacts , getContactsById}
