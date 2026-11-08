import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';

import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function uploadImage(
  buffer: Buffer,
  options: Pick<UploadApiOptions, 'public_id' | 'overwrite' | 'format'> = {},
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'food-delivery-app',
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary returned no image upload result.'));
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function deleteUploadedImage(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
  });

  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Cloudinary image cleanup failed: ${result.result}`);
  }
}
