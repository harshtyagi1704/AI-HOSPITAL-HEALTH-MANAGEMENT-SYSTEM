const crypto = require("crypto");
const Invoice = require("../models/Invoice");
const razorpay = require("../config/razorpay");
const logAudit = require("../utils/auditLogger");

const DEFAULT_TAX_RATE = 0.05; // 5% flat tax for demo purposes

// ================= GENERATE INVOICE NUMBER =================
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
};

// ================= CREATE INVOICE =================
// Called internally (e.g. after a consultation is saved) or directly by
// reception/admin for ad-hoc billing.
const createInvoiceInternal = async ({
  patient,
  doctor,
  consultation,
  appointment,
  items,
}) => {
  const subtotal = items.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const tax = Math.round(subtotal * DEFAULT_TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await Invoice.create({
    invoiceNumber,
    patient,
    doctor,
    consultation,
    appointment,
    items,
    subtotal,
    tax,
    total,
  });

  return invoice;
};

// ================= CREATE INVOICE (API) =================
const createInvoice = async (req, res) => {
  try {
    const { patientId, doctorId, consultationId, appointmentId, items } =
      req.body;

    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Patient and at least one billing item are required",
      });
    }

    const invoice = await createInvoiceInternal({
      patient: patientId,
      doctor: doctorId || null,
      consultation: consultationId || null,
      appointment: appointmentId || null,
      items,
    });

    await logAudit(req, "INVOICE_CREATED", `Invoice ${invoice.invoiceNumber} for patient ${patientId}`);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= MY INVOICES (PATIENT) =================
const getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ patient: req.user.id })
      .populate("doctor", "name department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= GET SINGLE INVOICE (RECEIPT) =================
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("patient", "name email phone")
      .populate("doctor", "name department");

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Patients can only view their own invoice
    if (
      req.user.role === "patient" &&
      invoice.patient._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= RAZORPAY: CREATE ORDER =================
// Patient initiates a real payment for a pending invoice. We create a
// Razorpay order for the invoice total and return the order details to the
// frontend, which then opens Razorpay Checkout.
const createRazorpayOrder = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (invoice.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ success: false, message: "Invoice already paid" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "Razorpay is not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    // Razorpay expects the amount in the smallest currency unit (paise for INR)
    const amountInPaise = Math.round(invoice.total * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: invoice.invoiceNumber,
      notes: {
        invoiceId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        patientId: req.user.id,
      },
    });

    invoice.razorpayOrderId = order.id;
    await invoice.save();

    await logAudit(
      req,
      "RAZORPAY_ORDER_CREATED",
      `Razorpay order ${order.id} created for invoice ${invoice.invoiceNumber}`
    );

    res.status(200).json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= RAZORPAY: VERIFY PAYMENT =================
// Called by the frontend after Razorpay Checkout succeeds. We re-verify the
// payment signature server-side (never trust the client) before marking the
// invoice as paid.
const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment details",
      });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (invoice.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    if (invoice.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Order mismatch" });
    }

    // Signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await logAudit(
        req,
        "RAZORPAY_PAYMENT_VERIFY_FAILED",
        `Signature mismatch for invoice ${invoice.invoiceNumber}`
      );

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Signature mismatch.",
      });
    }

    if (invoice.status !== "paid") {
      invoice.status = "paid";
      invoice.paymentMethod = "razorpay";
      invoice.transactionId = razorpayPaymentId;
      invoice.razorpayPaymentId = razorpayPaymentId;
      invoice.razorpaySignature = razorpaySignature;
      invoice.paidAt = new Date();

      await invoice.save();
    }

    await logAudit(
      req,
      "INVOICE_PAID",
      `Invoice ${invoice.invoiceNumber} paid via razorpay (payment ${razorpayPaymentId})`
    );

    res.status(200).json({
      success: true,
      message: "Payment verified and invoice marked as paid",
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= RAZORPAY: WEBHOOK =================
// Optional but recommended safety net so an invoice still gets marked paid
// even if the browser closes/crashes right after payment, before the
// frontend can call /verify. Configure this URL
// (POST {BACKEND_URL}/api/billing/webhook/razorpay) in the Razorpay
// Dashboard -> Webhooks, and set RAZORPAY_WEBHOOK_SECRET in backend/.env.
// This route must receive the RAW request body, which is wired up in
// server.js before the global express.json() middleware runs.
const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("⚠️  RAZORPAY_WEBHOOK_SECRET is not set, ignoring webhook call.");
      return res.status(200).json({ success: true });
    }

    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body; // Buffer, thanks to express.raw() in server.js

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const payload = JSON.parse(rawBody.toString());

    if (payload.event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (orderId) {
        const invoice = await Invoice.findOne({ razorpayOrderId: orderId });

        if (invoice && invoice.status !== "paid") {
          invoice.status = "paid";
          invoice.paymentMethod = "razorpay";
          invoice.transactionId = paymentId;
          invoice.razorpayPaymentId = paymentId;
          invoice.paidAt = new Date();
          await invoice.save();
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    res.status(500).json({ success: false });
  }
};

// ================= PAY INVOICE (SIMULATED PAYMENT) =================
// NOTE: This simulates a successful payment for demo purposes (kept for
// cash / manual reception entries). Online patient payments now go through
// Razorpay via createRazorpayOrder + verifyRazorpayPayment above.
const payInvoice = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (invoice.patient.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    if (invoice.status === "paid") {
      return res.status(400).json({ success: false, message: "Invoice already paid" });
    }

    invoice.status = "paid";
    invoice.paymentMethod = paymentMethod || "card";
    invoice.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
    invoice.paidAt = new Date();

    await invoice.save();

    await logAudit(req, "INVOICE_PAID", `Invoice ${invoice.invoiceNumber} paid via ${invoice.paymentMethod}`);

    res.status(200).json({
      success: true,
      message: "Payment successful",
      invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ================= ALL INVOICES (ADMIN) =================
const getAllInvoices = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .populate("patient", "name email")
      .populate("doctor", "name department")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const revenue = await Invoice.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.status(200).json({
      success: true,
      invoices,
      totalRevenue: revenue[0]?.total || 0,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createInvoiceInternal,
  createInvoice,
  getMyInvoices,
  getInvoiceById,
  payInvoice,
  getAllInvoices,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
};
