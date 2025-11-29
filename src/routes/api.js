const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    getStyles
} = require('../controllers/styleController');
const {
    uploadImage,
    createCollage
} = require('../controllers/imageController');

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {
        recursive: true
    });
    console.log('Created uploads directory');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/\W+/g, '-');
        cb(null, `${base}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

router.get('/styles', getStyles);
router.post('/upload', upload.single('photo'), uploadImage);
router.post('/collage', upload.single('photo'), createCollage);

module.exports = router;