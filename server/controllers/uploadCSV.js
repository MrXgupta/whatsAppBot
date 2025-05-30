const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage }).single('contactsFile');

const uploadCSV = (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.error('❌ Multer error:', err);
            return res.status(500).json({ error: 'File upload failed.' });
        }
        return res.status(200).json({ filePath: req.file.path });
    });
};

module.exports = uploadCSV;
