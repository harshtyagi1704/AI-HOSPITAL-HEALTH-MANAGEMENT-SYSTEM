const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {

    getAllUsers,
    createUser,
    updateUser,
    deleteUser

} = require("../controllers/authController");

// Get Users
router.get(
    "/",
    protect,
    authorize("admin"),
    getAllUsers
);

// Create User
router.post(
    "/",
    protect,
    authorize("admin"),
    createUser
);

// Update User
router.put(
    "/:id",
    protect,
    authorize("admin"),
    updateUser
);

// Delete User
router.delete(
    "/:id",
    protect,
    authorize("admin"),
    deleteUser
);

module.exports = router;