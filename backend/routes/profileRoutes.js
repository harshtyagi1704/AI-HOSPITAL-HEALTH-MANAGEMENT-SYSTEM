const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { uploadAvatarFile } = require("../utils/upload");

const {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  resendVerification,
  verifyEmail,
} = require("../controllers/profileController");

// ================= AUTHENTICATED PROFILE ACTIONS =================
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.post("/avatar", protect, uploadAvatarFile.single("avatar"), uploadAvatar);
router.put("/change-password", protect, changePassword);
router.post("/resend-verification", protect, resendVerification);

// ================= PUBLIC (NO AUTH) =================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;
