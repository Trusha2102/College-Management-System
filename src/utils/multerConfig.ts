import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import path from 'path';

const configureMulter = (uploadPath: string, fileSizeLimit: number) => {
  // Check if the upload folder exists, and create it if it doesn't
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath);
  }

  // Multer configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath); // Use the specified upload path
    },
    filename: (req, file, cb) => {
      cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); // File naming
    }
  });

  return multer({
    storage,
    limits: {
      fileSize: fileSizeLimit // Set the file size limit
    },
    fileFilter: (req, file, cb) => {
      const allowedFormats = ['.jpg', '.jpeg', '.png']; // Allowed file formats
      const extname = path.extname(file.originalname).toLowerCase();
      if (allowedFormats.includes(extname)) {
        cb(null, true); // Allow the file to be uploaded
      } else {
        cb(new Error('Only .jpg, .jpeg, and .png formats are allowed'));
      }
    }
  });
};

export default configureMulter;
