const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================= GENERIC UPLOAD FACTORY =================
// Creates a configured multer instance for a given subfolder under /uploads
// (e.g. "reports", "avatars"), with its own allowed mime types.

const makeUploader = (subfolder, allowedTypes, maxSizeMB = 10) => {
  const uploadDir = path.join(__dirname, "..", "uploads", subfolder);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Only ${allowedTypes.join(", ")} files are allowed`
        ),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};

// Medical reports: PDF or image, up to 10MB
const uploadReportFile = makeUploader(
  "reports",
  [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ],
  10
);

// Profile pictures: image only, up to 3MB (Phase 42)
const uploadAvatarFile = makeUploader(
  "avatars",
  ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  3
);

// Backwards-compatible default export (used by existing report routes)
module.exports = uploadReportFile;
module.exports.uploadReportFile = uploadReportFile;
module.exports.uploadAvatarFile = uploadAvatarFile;
