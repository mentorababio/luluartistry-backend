const express = require('express');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/products',
  protect,
  authorize('admin'),
  upload.array('images', 5),
  (req, res) => {
    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.status(200).json({
      success: true,
      images
    });
  }
);

module.exports = router;
