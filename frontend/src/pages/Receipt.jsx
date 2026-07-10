import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";

function Receipt() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/billing/${id}`);
        setInvoice(res.data.invoice);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <h2>Loading receipt...</h2>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <h2 style={{ color: "#888" }}>Invoice not found.</h2>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="receipt-no-print" style={{ marginBottom: "20px" }}>
        <button
          onClick={() => window.print()}
          style={{
            background: "#1976d2",
            color: "white",
            border: "none",
            padding: "10px 22px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div
        id="receipt"
        style={{
          background: "white",
          color: "#222",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ margin: 0, color: "#1976d2" }}>🏥 AI Hospital</h1>
          <p style={{ margin: "4px 0", color: "#666" }}>Payment Receipt</p>
        </div>

        <hr />

        <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0" }}>
          <div>
            <p style={{ margin: "4px 0" }}>
              <strong>Invoice #:</strong> {invoice.invoiceNumber}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "4px 0" }}>
              <strong>Status:</strong> {invoice.status.toUpperCase()}
            </p>
            {invoice.transactionId && (
              <p style={{ margin: "4px 0" }}>
                <strong>Txn ID:</strong> {invoice.transactionId}
              </p>
            )}
          </div>
        </div>

        <hr />

        <p style={{ margin: "12px 0 4px" }}>
          <strong>Billed To:</strong> {invoice.patient?.name}
        </p>
        <p style={{ margin: "4px 0", color: "#666" }}>{invoice.patient?.email}</p>

        {invoice.doctor?.name && (
          <p style={{ margin: "10px 0 4px" }}>
            <strong>Doctor:</strong> Dr. {invoice.doctor.name} ({invoice.doctor.department})
          </p>
        )}

        <table width="100%" style={{ marginTop: "20px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #1976d2" }}>
              <th style={{ textAlign: "left", padding: "8px 0" }}>Description</th>
              <th style={{ textAlign: "right", padding: "8px 0" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 0" }}>{item.description}</td>
                <td style={{ padding: "8px 0", textAlign: "right" }}>₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <p style={{ margin: "4px 0" }}>Subtotal: ₹{invoice.subtotal}</p>
          <p style={{ margin: "4px 0" }}>Tax: ₹{invoice.tax}</p>
          <h2 style={{ margin: "8px 0", color: "#1976d2" }}>
            Total: ₹{invoice.total}
          </h2>
        </div>

        <hr />

        <p style={{ textAlign: "center", color: "#999", marginTop: "20px" }}>
          Thank you for choosing AI Hospital. Get well soon! 💙
        </p>
      </div>

      <style>{`
        @media print {
          .app-sidebar, .sidebar-hamburger, .receipt-no-print { display: none !important; }
          .app-layout-content { margin-left: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </Layout>
  );
}

export default Receipt;
