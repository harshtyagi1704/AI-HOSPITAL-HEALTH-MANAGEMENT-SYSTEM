const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { checkSymptoms } = require("../controllers/aiController");

// AI Symptom Checker (any logged-in user, typically a patient)
router.post("/symptom-checker", protect, checkSymptoms);

module.exports = router;
