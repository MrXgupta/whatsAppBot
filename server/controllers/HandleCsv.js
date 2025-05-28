const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');
const { isValidPhoneNumber } = require('../utils/validators');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const handleCsv = [
    upload.single('file'),
    async (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

        const filePath = path.resolve(req.file.path);
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => {
                if (data.number) results.push(data.number.trim());
            })
            .on('end', () => {
                fs.unlinkSync(filePath);
                const validNumbers = results.filter(isValidPhoneNumber);
                const invalidNumbers = results.filter(num => !isValidPhoneNumber(num));
                res.json({ validNumbers, invalidNumbers });
            })
            .on('error', (err) => {
                fs.unlinkSync(filePath);
                console.error('CSV parse error:', err);
                res.status(500).json({ error: 'Failed to parse CSV file.' });
            });
    }
];

module.exports = handleCsv;