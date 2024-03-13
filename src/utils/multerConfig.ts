import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import path from 'path';

const configureMulter = (uploadPath: string) => {
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

  return multer({ storage });
};

export default configureMulter;
