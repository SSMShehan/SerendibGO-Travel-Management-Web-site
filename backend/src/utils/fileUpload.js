const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
// In Vercel (production), write to /tmp instead of root
const isProduction = process.env.NODE_ENV === 'production';
const rootDir = isProduction ? '/tmp' : path.join(__dirname, '../../../');
const uploadsDir = path.join(rootDir, 'uploads');
const vehicleImagesDir = path.join(uploadsDir, 'vehicles');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create uploads dir:', err);
  }
}

if (!fs.existsSync(vehicleImagesDir)) {
  try {
    fs.mkdirSync(vehicleImagesDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create vehicle images dir:', err);
  }
}

// Configure multer for vehicle images
const vehicleImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, vehicleImagesDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer configuration for vehicle images
const vehicleImageUpload = multer({
  storage: vehicleImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files
  }
});

// Function to save files from memory storage to disk
const saveMemoryFilesToDisk = async (files, vehicleId) => {
  if (!files || files.length === 0) return [];

  const savedFiles = [];

  for (const file of files) {
    if (file.mimetype.startsWith('image/')) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      const filename = `${name}-${uniqueSuffix}${ext}`;
      const filepath = path.join(vehicleImagesDir, filename);

      // Write buffer to file
      fs.writeFileSync(filepath, file.buffer);

      // Create URL for the saved file
      const fileUrl = `/uploads/vehicles/${filename}`;

      savedFiles.push({
        url: fileUrl,
        filename: filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
    }
  }

  return savedFiles;
};

// Function to delete file from disk
const deleteFileFromDisk = (fileUrl) => {
  try {
    const filename = path.basename(fileUrl);
    const filepath = path.join(vehicleImagesDir, filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Function to get file URL from filename
const getFileUrl = (filename) => {
  return `/uploads/vehicles/${filename}`;
};

module.exports = {
  vehicleImageUpload,
  saveMemoryFilesToDisk,
  deleteFileFromDisk,
  getFileUrl,
  vehicleImagesDir
};
