const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const ErrorResponse = require('../utils/errorResponse');

// ── Memory storage ────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();

// ── File filter — only allow images ──────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'), false);
  }
};

// ── Multer config with 5MB limit ──────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ── Upload buffer to Cloudinary ───────────────────────────────────────────────
const uploadToCloudinary = async (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `luluartistry/${folder}`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary };