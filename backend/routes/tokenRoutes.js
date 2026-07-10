const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    bookToken,
    getLiveQueue,
    getDoctorQueue,
    callPatient,
    getWaitingPrediction,
    getDashboardStats,
    getMyToken,
    completePatient,
    cancelToken
} = require("../controllers/tokenController");

// ================= PATIENT ROUTES =================

// Book Token
router.post(
    "/book",
    protect,
    authorize("patient"),
    bookToken
);

// View Live Queue (patients viewing the public queue, and reception managing it)
router.get(
    "/live",
    protect,
    authorize("patient", "reception"),
    getLiveQueue
);

// ================= DOCTOR ROUTES =================

// View Doctor Queue
router.get(
    "/doctor",
    protect,
    authorize("doctor"),
    getDoctorQueue
);

// Call Patient
router.put(
    "/:id/call",
    protect,
    authorize("doctor"),
    callPatient
);

router.get("/prediction/:id", protect, getWaitingPrediction);
router.get("/stats", protect, getDashboardStats);

// Patient's own current token (dashboard: current token, queue position, wait time, doctor)
router.get(
    "/my-token",
    protect,
    authorize("patient"),
    getMyToken
);

router.put(
    "/:id/complete",
    protect,
    authorize("doctor"),
    completePatient
);
router.put(
    "/:id/cancel",
    protect,
    authorize("reception", "patient"),
    cancelToken
);
module.exports = router;
