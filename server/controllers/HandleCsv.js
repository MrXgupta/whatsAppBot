const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');
const multer = require('multer');
const {isValidPhoneNumber} = require('../utils/validators');
const ContactGroup = require('../models/Contact');
const upload = multer({dest: 'uploads/'});

// Handling the csv file while saving the contact group
const handleCsv = [
    upload.single('file'),
    async (req, res) => {
        if (!req.file) return res.status(400).json({error: 'No file uploaded.'});

        const userId = req.user.id;
        const {groupName} = req.body;
        if (!groupName) return res.status(400).json({error: 'groupName is required.'});

        const filePath = path.resolve(req.file.path);
        const allNumbers = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => {
                if (data.number) allNumbers.push(data.number.trim());
            })
            .on('end', async () => {
                fs.unlinkSync(filePath);

                const uniqueNumbers = [...new Set(allNumbers)];
                const validNumbers = uniqueNumbers.filter(isValidPhoneNumber);
                const invalidNumbers = uniqueNumbers.filter(num => !isValidPhoneNumber(num));
                const duplicatesRemoved = allNumbers.length - uniqueNumbers.length;

                try {
                    const group = await ContactGroup.create({
                        userId,
                        groupName,
                        numbers: uniqueNumbers,
                        validNumbers,
                        invalidNumbers,
                        duplicatesRemoved,
                        validationStatus: 'completed'
                    });

                    res.status(201).json({
                        success: true,
                        message: 'Contact group created',
                        groupId: group._id,
                        stats: {
                            total: allNumbers.length,
                            unique: uniqueNumbers.length,
                            valid: validNumbers.length,
                            invalid: invalidNumbers.length,
                            duplicatesRemoved
                        }
                    });
                } catch (err) {
                    console.error('❌ Error saving contact group:', err);
                    res.status(500).json({success: false, message: 'Failed to save contact group'});
                }
            })
            .on('error', (err) => {
                fs.unlinkSync(filePath);
                console.error('CSV parse error:', err);
                res.status(500).json({error: 'Failed to parse CSV file.'});
            });
    }
];

module.exports = handleCsv;
