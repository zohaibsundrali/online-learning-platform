const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer, folder, transformation = []) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation,
        format: 'auto',
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    const readable = Readable.from([buffer]);
    readable.pipe(uploadStream);
  });
};

module.exports = uploadBufferToCloudinary;
