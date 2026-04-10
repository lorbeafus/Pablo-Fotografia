// Cloudinary Configuration
export const cloudinaryConfig = {
    cloudName: 'dhuqjaadf',
    uploadPreset: 'Pablo-fotografia',
    folder: 'Pablo-fotografia',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET
};

// Cloudinary Upload Widget URL
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
