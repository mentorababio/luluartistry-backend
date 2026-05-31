const express = require('express');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/products',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, error: 'No files uploaded' });
      }

      // ── FIX: upload each file buffer to Cloudinary ────────────────────────
      const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.buffer, 'products')
      );

      const images = await Promise.all(uploadPromises);
      // ─────────────────────────────────────────────────────────────────────

      res.status(200).json({ success: true, images });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;