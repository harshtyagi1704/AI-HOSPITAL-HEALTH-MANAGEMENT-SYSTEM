const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getPatientDetails,
  saveConsultation,
  getMedicalHistory,
  getMyMedicalHistory,
  getDoctorAnalytics,
} = require("../controllers/consultationController");

// ================= DOCTOR ROUTES =================

// Patient Details Popup
router.get(
  "/patient/:patientId",
  protect,
  authorize("doctor"),
  getPatientDetails
);

// Save Consultation
router.post("/", protect, authorize("doctor"), saveConsultation);

// Medical History of a specific patient (doctor view)
router.get(
  "/history/:patientId",
  protect,
  authorize("doctor"),
  getMedicalHistory
);

// Doctor Analytics
router.get(
  "/analytics",
  protect,
  authorize("doctor"),
  getDoctorAnalytics
);

// ================= PATIENT ROUTES =================

// Logged-in patient's own history
router.get(
  "/my-history",
  protect,
  authorize("patient"),
  getMyMedicalHistory
);

module.exports = router;
