const Invoice = require("../models/Invoice");
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

// ================= PAY INVOICE (SIMULATED PAYMENT) =================
// NOTE: This simulates a successful payment for demo purposes. To go live,
// swap this out for a real gateway (Razorpay/Stripe) — create an order,
// verify the signature/webhook, and only then mark the invoice as paid.
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
};
