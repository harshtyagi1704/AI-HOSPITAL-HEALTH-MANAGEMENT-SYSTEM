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
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/billingController");

// NOTE: the Razorpay webhook route (POST /api/billing/webhook/razorpay) is
// mounted separately in server.js because it needs the raw request body for
// signature verification, before express.json() runs.

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

// Patient - pay an invoice (simulated payment, e.g. cash/manual entry)
router.put("/:id/pay", protect, authorize("patient"), payInvoice);

// Patient - create a Razorpay order for a pending invoice
router.post(
  "/:id/razorpay/order",
  protect,
  authorize("patient"),
  createRazorpayOrder
);

// Patient - verify Razorpay payment after Checkout succeeds
router.post(
  "/:id/razorpay/verify",
  protect,
  authorize("patient"),
  verifyRazorpayPayment
);

module.exports = router;
