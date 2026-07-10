const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../utils/upload");

const {
  uploadReport,
  getMyReports,
  getPatientReports,
  deleteReport,
} = require("../controllers/reportController");

// Upload (patient uploads own report; doctor/receptionist can upload on behalf of a patient)
router.post(
  "/upload",
  protect,
  authorize("patient", "doctor", "reception"),
  upload.single("file"),
  uploadReport
);

// Patient - view own reports
router.get("/my", protect, authorize("patient"), getMyReports);

// Doctor - view a specific patient's reports
router.get(
  "/patient/:patientId",
  protect,
  authorize("doctor"),
  getPatientReports
);

// Delete
router.delete("/:id", protect, deleteReport);

module.exports = router;
