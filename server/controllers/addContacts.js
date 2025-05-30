const fs = require('fs');
const csv = require('csv-parser');
const Contacts = require('../models/Contact');

const validateNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return /^91[6-9][0-9]{9}$/.test(cleaned);
};

const AddContactGroup = async (req, res) => {
    try {
        const { groupName, filePath } = req.body;

        if (!groupName || !filePath) {
            return res.status(400).json({ error: 'Group name and file path are required.' });
        }

        const existing = await Contacts.findOne({ groupName });
        if (existing) {
            return res.status(400).json({ error: 'Group name already exists.' });
        }

        const numbers = [];
        let rowCount = 0;

        fs.createReadStream(filePath)
            .pipe(csv({ headers: ['number'], skipLines: 1 }))
            .on('data', (row) => {
                rowCount++;
                let raw = row.number?.toString().trim();
                if (!raw || raw.toLowerCase() === 'number') return;


                const cleanedNum = Number(raw).toString().replace(/\.0+$/, '');
                if (cleanedNum.length >= 10) {
                    numbers.push(cleanedNum);
                }
            })
            .on('end', async () => {
                if (!numbers.length) {
                    return res.status(400).json({ error: 'CSV contains no valid numbers.' });
                }

                const group = await Contacts.create({
                    groupName,
                    numbers,
                    validNumbers: [],
                    invalidNumbers: [],
                    validationStatus: 'pending',
                    addedAt: new Date(),
                    duplicatesRemoved: 0,
                });

                console.log(`📥 CSV processed and group saved: ${group._id}`);

                setImmediate(async () => {
                    const seen = new Set();
                    const validNumbers = [];
                    const invalidNumbers = [];
                    let duplicatesRemoved = 0;

                    numbers.forEach(number => {
                        const cleaned = number.replace(/\D/g, '');
                        if (!seen.has(cleaned)) {
                            seen.add(cleaned);
                            validateNumber(cleaned) ? validNumbers.push(cleaned) : invalidNumbers.push(cleaned);
                        } else {
                            duplicatesRemoved++;
                        }
                    });

                    await Contacts.findByIdAndUpdate(group._id, {
                        validNumbers,
                        invalidNumbers,
                        validationStatus: 'validated',
                        duplicatesRemoved,
                    });

                    fs.unlink(filePath, err => {
                        if (err) console.error('❌ Error deleting uploaded file:', err);
                        else console.log('🗑️ CSV file deleted after validation.');
                    });

                    console.log(`✅ Validation completed for group: ${group.groupName}`);
                });

                res.status(201).json({
                    success: true,
                    message: 'Group saved. Validation will be processed in background.'
                });
            });

    } catch (error) {
        console.error('Error saving contact group:', error);
        res.status(500).json({ error: 'Failed to save contact group.' });
    }
};

const getContacts = async (req, res) => {
    try {
        const groups = await Contacts.find().sort({ addedAt: -1 });
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