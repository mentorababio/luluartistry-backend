// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Explicitly ensure the config is applied
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ CLOUDINARY CONFIG ERROR: Missing environment variables.");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// Export the already configured instance
module.exports = cloudinary;