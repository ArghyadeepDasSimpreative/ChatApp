import multer from "multer";
import path from "path";
import fs from "fs";

const createStorage = (folderPath = "uploads") => {
  // Ensure folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, folderPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|svg|webp|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const getMulter = (folderPath = "uploads") =>
  multer({
    storage: createStorage(folderPath),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  });

export const uploadSingleFile = (fieldName, folderPath = "uploads") => {
  return getMulter(folderPath).single(fieldName);
};

export const uploadMultipleFiles = (fieldName, maxCount = 5, folderPath = "uploads") => {
  return getMulter(folderPath).array(fieldName, maxCount);
};
