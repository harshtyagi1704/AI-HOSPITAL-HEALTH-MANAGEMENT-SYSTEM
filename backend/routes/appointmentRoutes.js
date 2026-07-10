const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getDoctors,
  setAvailability,
  getMyAvailability,
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");

// Public-ish (any authenticated user) - list doctors to book with
router.get("/doctors", protect, getDoctors);

// ================= PATIENT =================
router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/my", protect, authorize("patient"), getMyAppointments);
router.put(
  "/:id/cancel",
  protect,
  authorize("patient"),
  cancelAppointment
);

// ================= DOCTOR =================
router.get(
  "/availability",
  protect,
  authorize("doctor"),
  getMyAvailability
);
router.put(
  "/availability",
  protect,
  authorize("doctor"),
  setAvailability
);
router.get(
  "/calendar",
  protect,
  authorize("doctor"),
  getDoctorAppointments
);
router.put(
  "/:id/status",
  protect,
  authorize("doctor"),
  updateAppointmentStatus
);

module.exports = router;
