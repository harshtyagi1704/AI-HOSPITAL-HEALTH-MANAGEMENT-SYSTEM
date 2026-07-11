const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const logAudit = require("../utils/auditLogger");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email");

const FRONTEND_URL = process.env.FRONTEND_URL || "https://ai-hospital-health-manageme-git-0df19f-harshtyagi1704s-projects.vercel.app";

// ================= GET MY PROFILE =================
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= UPDATE PROFILE (NAME / PHONE) =================
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, age } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (age !== undefined && age !== "") user.age = Number(age);

    await user.save();

    await logAudit(req, "PROFILE_UPDATED", "User updated their profile");

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({ success: true, message: "Profile updated", user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= UPLOAD / CHANGE PROFILE PICTURE (Phase 42) =================
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please attach an image" });
    }

    const user = await User.findById(req.user.id);
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    await logAudit(req, "AVATAR_UPDATED", "User updated their profile picture");

    res.status(200).json({
      success: true,
      message: "Profile picture updated",
      avatar: user.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= CHANGE PASSWORD (Phase 42) =================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await logAudit(req, "PASSWORD_CHANGED", "User changed their password");

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= FORGOT PASSWORD (Phase 42) =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always respond with success to avoid leaking which emails are registered
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins

    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${rawToken}`;
    await sendPasswordResetEmail(user, resetUrl);

    await logAudit(req, "PASSWORD_RESET_REQUESTED", `Reset requested for ${email}`);

    res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= RESET PASSWORD (Phase 42) =================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await logAudit(req, "PASSWORD_RESET", `Password reset completed for ${user.email}`);

    res.status(200).json({ success: true, message: "Password reset successfully. Please log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= SEND / RESEND VERIFICATION EMAIL (Phase 42) =================
const sendVerification = async (user) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  const verifyUrl = `${FRONTEND_URL}/verify-email/${rawToken}`;
  await sendVerificationEmail(user, verifyUrl);
};

const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    await sendVerification(user);

    res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
 console.log("VERIFY TOKEN RECEIVED:", token);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

console.log("HASHED TOKEN:", hashedToken);
    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpires: { $gt: Date.now() },
    });
console.log("USER FOUND:", user ? user.email : "NO USER");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or has expired",
      });
    }

    user.isVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
  resendVerification,
  verifyEmail,
  sendVerification, // exported so authController can trigger it on registration
};
