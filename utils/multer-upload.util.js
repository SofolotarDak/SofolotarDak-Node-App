// External Inputs
const multer = require('multer');
const path = require('path');

// renaming the uploaded file and defind it's storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/Uploads');
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'storyimage') {
            try {
                const fileExt = path.extname(file.originalname);
                const allowedExtensions = ['.png', '.jpg'];
                const maxSize = 1 * 1024 * 1024; // 1MB

                if (
                    allowedExtensions.includes(fileExt) &&
                    file.size <= maxSize
                ) {
                    cb(null, true);
                } else {
                    throw new Error(
                        'Invalid file. Only PNG and JPG files up to 1MB are allowed.'
                    );
                }
            } catch (error) {
                cb(error);
            }
        }
    },
});

// prepare the multer upload object
const upload = multer({
    storage,
    limits: {
        fileSize: 1000000, // 1MB
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'storyimage') {
            const fileExt = path.extname(file.originalname);

            if (fileExt === '.png' || fileExt === '.jpg') {
                cb(null, true);
            } else {
                cb(null, false);
            }
        }
    },
});

module.exports = upload;
