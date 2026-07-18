import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import { SkeletonCard } from "../components/Skeleton";
import api from "../services/api";
import { openRazorpayCheckout } from "../utils/razorpay";

const statusColor = {
  pending: "#f57c00",
  paid: "#2e7d32",
  cancelled: "#9e9e9e",
};

function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processingId, setProcessingId] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/billing/my");
      setInvoices(res.data.invoices);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (id) => {
    // "Cash" is settled manually at the front desk, so we keep the simple
    // simulated flow for that. Card/UPI/Net Banking go through Razorpay.
    if (paymentMethod === "cash") {
      try {
        await api.put(`/billing/${id}/pay`, { paymentMethod });
        toast.success("Marked as paid (cash) 🎉");
        fetchInvoices();
      } catch (error) {
        toast.error(error.response?.data?.message || "Payment failed");
      }
      return;
    }

    setProcessingId(id);

    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");

      // 1. Ask backend to create a Razorpay order for this invoice
      const orderRes = await api.post(`/billing/${id}/razorpay/order`);
      const { order, keyId, invoice } = orderRes.data;

      // 2. Open Razorpay Checkout and wait for the user to complete payment
      const paymentResponse = await openRazorpayCheckout({
        order,
        keyId,
        invoice,
        patientName: user?.name,
        patientEmail: user?.email,
        patientPhone: user?.phone,
      });

      // 3. Verify the payment signature server-side before trusting it
      await api.post(`/billing/${id}/razorpay/verify`, {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      toast.success("Payment successful 🎉");
      setPayingId(null);
      fetchInvoices();
    } catch (error) {
      if (error.message === "Payment cancelled") {
        toast.info("Payment cancelled");
      } else {
        toast.error(
          error.response?.data?.message || error.message || "Payment failed"
        );
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Layout>
      <h2 style={{marginTop: "-15px", color: "#256d97" }}>MY INVOICES</h2>
      <p style={{ color: "#666", marginBottom: "10px" }}>
        View and pay your hospital bills securely via Razorpay (Card / UPI /
        Net Banking), or mark cash payments made at the front desk.
      </p>

      {loading && (
        <div style={{ display: "grid", gap: "16px" }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && invoices.length === 0 && (
        <h2 style={{ color: "#888" }}>No invoices yet.</h2>
      )}

      {!loading && invoices.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {invoices.map((inv) => (
            <div key={inv._id} className="card" style={{ cursor: "default" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{inv.invoiceNumber}</h3>
                  <p style={{ margin: "2px 0" }}>
                    Dr. {inv.doctor?.name || "—"} · {inv.doctor?.department || ""}
                  </p>
                  <p style={{ margin: "2px 0", color: "#888" }}>
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      color: "white",
                      background: statusColor[inv.status] || "#666",
                      display: "inline-block",
                      marginBottom: "8px",
                    }}
                  >
                    {inv.status}
                  </span>
                  <h2 style={{ margin: 0, color: "#1976d2" }}>₹{inv.total}</h2>
                </div>
              </div>

              <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  to={`/billing/invoice/${inv._id}`}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #1976d2",
                    color: "#1976d2",
                    borderRadius: "6px",
                    textDecoration: "none",
                  }}
                >
                  View Receipt
                </Link>

                {inv.status === "pending" && (
                  <>
                    {payingId === inv._id ? (
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ padding: "8px", borderRadius: "6px" }}
                        >
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="netbanking">Net Banking</option>
                          <option value="cash">Cash</option>
                        </select>
                        <button
                          onClick={() => handlePay(inv._id)}
                          disabled={processingId === inv._id}
                          style={{
                            background: "#2e7d32",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor:
                              processingId === inv._id
                                ? "not-allowed"
                                : "pointer",
                            opacity: processingId === inv._id ? 0.7 : 1,
                          }}
                        >
                          {processingId === inv._id
                            ? "Processing..."
                            : `Confirm Pay ₹${inv.total}`}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPayingId(inv._id)}
                        style={{
                          background: "#1976d2",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        💳 Pay Now
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default MyInvoices;
