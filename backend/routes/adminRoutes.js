const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getDashboardStats,
    getDailyPatients,
    getMonthlyPatients,
    getDepartmentStats,
    getDoctorPerformance,
    getQueueTrends
} = require("../controllers/adminController");

router.get(
    "/dashboard",
    protect,
    authorize("admin"),
    getDashboardStats
);

router.get(
    "/analytics/daily-patients",
    protect,
    authorize("admin"),
    getDailyPatients
);

router.get(
    "/analytics/monthly-patients",
    protect,
    authorize("admin"),
    getMonthlyPatients
);

router.get(
    "/analytics/department-stats",
    protect,
    authorize("admin"),
    getDepartmentStats
);

router.get(
    "/analytics/doctor-performance",
    protect,
    authorize("admin"),
    getDoctorPerformance
);

router.get(
    "/analytics/queue-trends",
    protect,
    authorize("admin"),
    getQueueTrends
);

module.exports = router;
