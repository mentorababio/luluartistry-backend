const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// USE MEMORY STORAGE ONLY
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = async (buffer, folder) => {
    return new Promise((resolve, reject) => {
        // Use the 'uploader' property directly
        cloudinary.uploader.upload_stream(
            { folder: `luluartistry/${folder}` },
            (error, result) => {
                if (error) return reject(error);
                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        ).end(buffer);
    });
};

module.exports = { upload, uploadToCloudinary };