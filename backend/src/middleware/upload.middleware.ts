import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDirectory = path.resolve('uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/octet-stream',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const filename = `${Date.now()}-${Math.round(
      Math.random() * 1_000_000_000
    )}${extension}`;

    callback(null, filename);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

  console.log('Uploaded file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    extension,
  });

  const hasValidExtension = allowedExtensions.has(extension);
  const hasValidMimeType = allowedMimeTypes.has(file.mimetype);

  if (!hasValidExtension || !hasValidMimeType) {
    return callback(
      new Error(
        'Only JPG, JPEG, PNG, and WebP image files are allowed.'
      )
    );
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});