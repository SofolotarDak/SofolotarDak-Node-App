// External Inputs
const multer = require('multer');
const path = require('path');

// Renaming the uploaded file and defining its storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/Uploads');
    },
    filename: (req, file, cb) => {
        try {
            const fileExt = path.extname(file.originalname);
            const fileName = `${file.originalname
                .replace(fileExt, '')
                .toLowerCase()
                .split(' ')
                .join('-')}-${Date.now()}`;
            cb(null, fileName + fileExt);
        } catch (error) {
            cb(error);
        }
    },
});

// Prepare the multer upload object
const upload = multer({
    storage,
    limits: {
        fileSize: 1000000, // 1MB
    },
    fileFilter: (req, file, cb) => {
        try {
            if (file.fieldname === 'storyimage') {
                const fileExt = path.extname(file.originalname);
                if (fileExt === '.png' || fileExt === '.jpg') {
                    cb(null, true);
                } else {
                    cb(null, false);
                }
            }
        } catch (error) {
            cb(error);
        }
    },
});

module.exports = upload;
