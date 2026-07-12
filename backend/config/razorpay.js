const Razorpay = require("razorpay");

// ================= RAZORPAY INSTANCE =================
// Reads credentials from environment variables. Keep RAZORPAY_KEY_ID and
// RAZORPAY_KEY_SECRET set in backend/.env (see .env.example).
//
// NOTE: We don't throw here if the keys are missing so that the rest of the
// app (auth, appointments, etc.) can still run without Razorpay configured.
// Any attempt to actually create an order will fail with a clear error
// instead (see billingController.createRazorpayOrder).

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn(
    "⚠️  Razorpay keys are not set. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env to enable online payments."
  );
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

module.exports = razorpay;
