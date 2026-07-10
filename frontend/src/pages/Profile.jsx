import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import Layout from "../components/Layout";
import LogoutButton from "../components/LogoutButton";
import api from "../services/api";

const API_ORIGIN = "https://hospital-backend-9e41.onrender.com";

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  marginTop: "6px",
  marginBottom: "16px",
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [resending, setResending] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", age: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile/me");
      setProfile(res.data.user);
      setForm({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
        age: res.data.user.age || "",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put("/profile/me", form);
      setProfile(res.data.user);

      // Keep sidebar/localStorage user name in sync
      const localUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...localUser, name: res.data.user.name })
      );

      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const res = await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((prev) => ({ ...prev, avatar: res.data.avatar }));

      const localUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...localUser, avatar: res.data.avatar })
      );

      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await api.put("/profile/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await api.post("/profile/resend-verification");
      toast.success("Verification email sent — check your inbox");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <h2>Loading profile...</h2>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <h2 style={{ color: "#888" }}>Could not load your profile. Please refresh.</h2>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 style={{ color: "#217094",marginTop: "-15px" }}>MY PROFILE</h2>

      {!profile.isVerified && (
        <div
          className="card"
          style={{
            cursor: "default",
            marginBottom: "30px",
            background: "#3f7f81",
            borderLeft: "5px solid #131211",
            textAlign: "left",
          }}
        >
          <strong>⚠️ Your email is not verified.</strong>
          <p style={{ margin: "6px 0" }}>
            Verify your email to secure your account.
          </p>
          <button
            onClick={handleResendVerification}
            disabled={resending}
            style={{
              background: "#f9a825",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "24px",
        }}
      >
        {/* ================= AVATAR + BASIC INFO ================= */}
        <div className="card" style={{ cursor: "default", textAlign: "left" }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            {profile.avatar ? (
              <img
                src={`${API_ORIGIN}${profile.avatar}`}
                alt="avatar"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <FaUserCircle size={100} color="#1976d2" />
            )}

            <div style={{ marginTop: "10px" }}>
              <label
                style={{
                  cursor: "pointer",
                  color: "#1976d2",
                  textDecoration: "underline",
                }}
              >
                {uploadingAvatar ? "Uploading..." : "Change Profile Picture"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleProfileSave}>
            <label>Full Name</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label>Email (cannot be changed)</label>
            <input style={inputStyle} value={profile.email} disabled />

            <label>Phone</label>
            <input
              style={inputStyle}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <label>Age</label>
            <input
              style={inputStyle}
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />

            <button
              type="submit"
              disabled={savingProfile}
              style={{
                background: "#1976d2",
                color: "white",
                border: "none",
                padding: "10px 22px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ================= CHANGE PASSWORD ================= */}
        <div className="card" style={{ cursor: "default", textAlign: "left" }}>
          <h3 style={{ marginTop: 0 }}>🔒 Change Password</h3>

          <form onSubmit={handlePasswordChange}>
            <label>Current Password</label>
            <input
              style={inputStyle}
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              required
            />

            <label>New Password</label>
            <input
              style={inputStyle}
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              required
              minLength={6}
            />

            <label>Confirm New Password</label>
            <input
              style={inputStyle}
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={savingPassword}
              style={{
                background: "#c62828",
                color: "white",
                border: "none",
                padding: "10px 22px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {savingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: "50px", display: "flex", justifyContent: "flex-end" }}>
        <LogoutButton />
      </div>
    </Layout>
  );
}

export default Profile;
