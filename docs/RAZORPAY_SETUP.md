# Razorpay Payment Gateway Setup

Real online payments for patient invoices are now powered by Razorpay,
replacing the old "simulated" pay button (cash is still simulated/manual,
since it's settled at the front desk).

## 1. Get your API keys

1. Sign up / log in at https://dashboard.razorpay.com
2. Go to **Settings -> API Keys** and generate a **Key Id** and **Key Secret**.
   - Use **Test Mode** keys while developing.
   - Switch to **Live Mode** keys only when you're ready to accept real payments.

## 2. Fill in the environment variables

### backend/.env
```
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# Optional, only if you set up a webhook (step 4)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### frontend/.env
```
VITE_RAZORPAY_KEY_ID=your_key_id_here
```
This must be the **same** Key Id as in `backend/.env`. The Key Id is public
and safe to ship in frontend code — the Key **Secret** must never be exposed
to the frontend, which is why it only lives in `backend/.env`.

After editing `frontend/.env`, restart the Vite dev server (`npm run dev`) so
the new variable is picked up. If you're deploying to Vercel, add
`VITE_RAZORPAY_KEY_ID` in the project's Environment Variables settings too.

## 3. How the flow works

1. Patient clicks **Pay Now** on an invoice (Card / UPI / Net Banking) in
   **My Invoices**.
2. Frontend calls `POST /api/billing/:id/razorpay/order`, which creates a
   Razorpay Order for the invoice's total amount.
3. Frontend opens the Razorpay Checkout modal (`checkout.js`, loaded in
   `index.html`) using that order.
4. On success, the frontend calls
   `POST /api/billing/:id/razorpay/verify` with the payment id, order id
   and signature returned by Razorpay.
5. The backend **re-verifies the signature itself** using
   `RAZORPAY_KEY_SECRET` (HMAC SHA256) before marking the invoice as
   `paid` — the frontend response is never trusted blindly.

Cash payments still use the original `PUT /api/billing/:id/pay` route and
are marked paid immediately (for front-desk collection).

## 4. (Optional but recommended) Webhook for extra reliability

If a user closes the browser tab right after paying but before step 4 above
completes, the invoice could stay "pending" even though Razorpay collected
the money. A webhook protects against this.

1. In the Razorpay Dashboard, go to **Settings -> Webhooks -> Add New
   Webhook**.
2. Webhook URL: `https://YOUR_BACKEND_URL/api/billing/webhook/razorpay`
3. Active events: enable `payment.captured`.
4. Copy the generated **Webhook Secret** into `RAZORPAY_WEBHOOK_SECRET` in
   `backend/.env`.

The webhook route is already wired up in `backend/server.js` (it reads the
raw request body, which is required for Razorpay's signature check).

## 5. Testing payments

In Test Mode, Razorpay provides test card/UPI details you can use to
simulate a full payment without moving real money:
https://razorpay.com/docs/payments/payments/test-card-upi-details/

## Files changed / added for this integration

- `backend/config/razorpay.js` — Razorpay SDK instance
- `backend/controllers/billingController.js` — order creation, payment
  verification, webhook handler
- `backend/routes/billingRoutes.js` — new `/razorpay/order` and
  `/razorpay/verify` routes
- `backend/server.js` — raw-body webhook route
- `backend/models/Invoice.js` — Razorpay order/payment/signature fields
- `backend/.env` / `backend/.env.example` — new Razorpay env vars (blank,
  fill in your own keys)
- `frontend/src/utils/razorpay.js` — Checkout SDK loader + open helper
- `frontend/src/pages/MyInvoices.jsx` — real payment flow for patients
- `frontend/index.html` — Razorpay `checkout.js` script tag
- `frontend/.env` / `frontend/.env.example` — new `VITE_RAZORPAY_KEY_ID`
  (blank, fill in your own key id)
