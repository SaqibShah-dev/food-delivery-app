import multer from 'multer';
import path from 'path';

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/octet-stream',
]);

const fileFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();

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
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});