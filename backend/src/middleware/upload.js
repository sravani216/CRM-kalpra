const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorHandler');

// Root uploads directory
const UPLOADS_ROOT = path.join(__dirname, '../../uploads');
const DIRS = {
  avatars: path.join(UPLOADS_ROOT, 'avatars'),
  photos: path.join(UPLOADS_ROOT, 'photos'),
  reports: path.join(UPLOADS_ROOT, 'reports'),
};

/**
 * Ensure all required upload directories exist on disk
 */
const ensureUploadDirs = () => {
  Object.values(DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Create directories immediately upon module load
ensureUploadDirs();

// Storage configuration with timestamp and safe sanitized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirs();
    if (file.fieldname === 'avatar') {
      cb(null, DIRS.avatars);
    } else if (file.fieldname === 'photo') {
      cb(null, DIRS.photos);
    } else if (file.fieldname === 'report') {
      cb(null, DIRS.reports);
    } else {
      cb(null, UPLOADS_ROOT);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBaseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${cleanBaseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter based on mime type and extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === 'avatar' || file.fieldname === 'photo') {
    const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const isImageMime = file.mimetype.startsWith('image/');

    if (isImageMime && allowedImageExts.includes(ext)) {
      return cb(null, true);
    }
    return cb(new AppError('Only image files (JPG, PNG, WebP, GIF) are allowed for photos/avatars.', 400));
  }

  if (file.fieldname === 'report') {
    const allowedDocExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.jpg', '.jpeg', '.png'];
    if (allowedDocExts.includes(ext)) {
      return cb(null, true);
    }
    return cb(new AppError('Only documents (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV) or images are allowed for reports.', 400));
  }

  cb(null, true);
};

// Base multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter,
});

module.exports = {
  uploadAvatar: upload.single('avatar'),
  uploadTaskFiles: upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'report', maxCount: 1 },
  ]),
  ensureUploadDirs,
  UPLOADS_ROOT,
};

