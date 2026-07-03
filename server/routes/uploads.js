const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = (req.query.folder || 'misc').replace(/[^a-zA-Z0-9/_-]/g, '');
    const dir = path.join(UPLOAD_ROOT, folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB, mirrors old Storage rules cap
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
    cb(null, true);
  },
});

// POST /uploads?folder=tournaments  (multipart field "file") → { url }
router.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const folder = (req.query.folder || 'misc').replace(/[^a-zA-Z0-9/_-]/g, '');
  const url = `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
