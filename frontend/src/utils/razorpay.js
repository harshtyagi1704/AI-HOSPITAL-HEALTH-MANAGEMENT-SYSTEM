// ================= RAZORPAY CHECKOUT HELPER =================
// The checkout.js SDK is loaded via a <script> tag in index.html. This
// helper waits for it to be ready (in case it's still loading) and exposes
// a simple promise-based API to open the checkout modal.

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Opens Razorpay Checkout for a given order and resolves with the raw
 * success response ({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
 * once the user completes payment. Rejects if the SDK fails to load or the
 * user dismisses the modal.
 */
export const openRazorpayCheckout = async ({
  order,
  keyId,
  invoice,
  patientName,
  patientEmail,
  patientPhone,
}) => {
  const loaded = await loadRazorpayScript();

  if (!loaded || !window.Razorpay) {
    throw new Error(
      "Razorpay SDK failed to load. Check your internet connection and try again."
    );
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "AI Hospital Health Management System",
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      order_id: order.id,
      prefill: {
        name: patientName || "",
        email: patientEmail || "",
        contact: patientPhone || "",
      },
      theme: {
        color: "#1976d2",
      },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    };

    const razorpayInstance = new window.Razorpay(options);

    razorpayInstance.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "Payment failed"));
    });

    razorpayInstance.open();
  });
};
