const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    registerPatient,
    searchPatients,
    editPatient,
    bookTokenForPatient,
    getTodayBookings
} = require("../controllers/receptionController");

router.post(
    "/register",
    protect,
    authorize("reception"),
    registerPatient
);

router.get(
    "/patients",
    protect,
    authorize("reception"),
    searchPatients
);

router.put(
    "/patients/:id",
    protect,
    authorize("reception"),
    editPatient
);

router.post(
    "/book",
    protect,
    authorize("reception"),
    bookTokenForPatient
);

router.get(
    "/today",
    protect,
    authorize("reception"),
    getTodayBookings
);

module.exports = router;