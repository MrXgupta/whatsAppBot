const fs = require('fs');
const csv = require('csv-parser');
const Contacts = require('../models/Contact');

// This function will validate the number
const validateNumber = (number) => {
    const cleaned = number.replace(/\D/g, '');
    return /^91[6-9][0-9]{9}$/.test(cleaned);
};

// This function will validate and save all the numbers in the db , it will validate in Background
const AddContactGroup = async (req, res) => {
    try {
        const {userId, groupName, filePath} = req.body;

        if (!userId || !groupName || !filePath) {
            return res.status(400).json({error: 'User ID, group name, and file path are required.'});
        }

        const existing = await Contacts.findOne({userId, groupName});
        if (existing) {
            return res.status(400).json({error: 'Group name already exists for this user.'});
        }

        const numbers = [];
        let rowCount = 0;

        fs.createReadStream(filePath)
            .pipe(csv({headers: ['number'], skipLines: 1}))
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
                    return res.status(400).json({error: 'CSV contains no valid numbers.'});
                }

                const group = await Contacts.create({
                    userId,
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
        res.status(500).json({error: 'Failed to save contact group.'});
    }
};

// Function to fetch the contacts groups per user
const getContacts = async (req, res) => {
    try {
        const {userId} = req.body;
        if (!userId) return res.status(400).json({error: 'User ID is required'});

        const groups = await Contacts.find({userId}).sort({addedAt: -1});
        res.status(200).json({success: true, groups});
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({error: 'Failed to fetch contacts.'});
    }
};

// Function to get the contacts from the contact Group
const getContactsById = async (req, res) => {
    const {id} = req.params;
    const {type = 'all', page = 1, limit = 10} = req.query;

    try {
        const group = await Contacts.findOne({_id: id});
        if (!group) {
            return res.status(404).json({error: 'Group not found for this user'});
        }

        let numbersToSend = [];
        if (type === 'valid') {
            numbersToSend = group.validNumbers;
        } else if (type === 'invalid') {
            numbersToSend = group.invalidNumbers;
        } else {
            numbersToSend = group.numbers;
        }

        const total = numbersToSend.length;
        const start = (parseInt(page) - 1) * parseInt(limit);
        const end = start + parseInt(limit);
        const paginatedNumbers = numbersToSend.slice(start, end);

        res.status(200).json({
            groupInfo: {
                groupName: group.groupName,
                addedAt: group.addedAt,
                validationStatus: group.validationStatus,
                totalContacts: group.numbers.length,
                totalValid: group.validNumbers.length,
                totalInvalid: group.invalidNumbers.length,
                duplicatesRemoved: group.duplicatesRemoved
            },
            numbers: paginatedNumbers,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error('❌ Error fetching group by ID:', err);
        res.status(500).json({error: 'Failed to get the details'});
    }
};

// Function to delete the whole contact group 
const deleteGroupContact = async (req, res) => {
    try {
        const {id, userId} = req.params;

        const deleted = await Contacts.findOneAndDelete({_id: id, userId});

        if (!deleted) {
            return res.status(404).json({success: false, message: "Group contact not found or unauthorized"});
        }

        res.status(200).json({success: true, message: "Group contact deleted successfully"});
    } catch (err) {
        console.error("Error deleting group contact:", err);
        res.status(500).json({success: false, message: "Internal server error"});
    }
};

module.exports = {AddContactGroup, getContacts, getContactsById, deleteGroupContact};