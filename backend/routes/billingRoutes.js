const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createInvoice,
  getMyInvoices,
  getInvoiceById,
  payInvoice,
  getAllInvoices,
} = require("../controllers/billingController");

// Doctor/Reception/Admin - create an ad-hoc invoice
router.post(
  "/",
  protect,
  authorize("doctor", "reception", "admin"),
  createInvoice
);

// Patient - view own invoices
router.get("/my", protect, authorize("patient"), getMyInvoices);

// Admin - view all invoices + revenue
router.get("/", protect, authorize("admin"), getAllInvoices);

// View a single invoice / receipt (patient sees own, staff can view any)
router.get("/:id", protect, getInvoiceById);

// Patient - pay an invoice (simulated payment)
router.put("/:id/pay", protect, authorize("patient"), payInvoice);

module.exports = router;
