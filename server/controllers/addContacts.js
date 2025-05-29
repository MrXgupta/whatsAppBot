const Contacts = require('../models/Contact');

const validateNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return /^91[6-9][0-9]{9}$/.test(cleaned);
};

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

        const validNumbers = [];
        const invalidNumbers = [];

        numbers.forEach(number => {
            if (validateNumber(number)) {
                validNumbers.push(number);
            } else {
                invalidNumbers.push(number);
            }
        });

        const group = await Contacts.create({
            groupName,
            numbers,
            validNumbers,
            invalidNumbers,
            validationStatus: 'validated',
            addedAt: new Date(),
        });

        res.status(201).json({
            success: true,
            group,
            stats: {
                total: numbers.length,
                valid: validNumbers.length,
                invalid: invalidNumbers.length,
            }
        });
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

module.exports = { AddContactGroup, getContacts, getContactsById };