import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'file', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const originalName = file.originalname.split('.')[0];
      return `${originalName}_${timestamp}`; 
    },
  },
});

export const upload = multer({ storage })