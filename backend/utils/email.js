const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// ================= CONFIGURATION =================

const isConfigured = () =>
  Boolean(
    process.env.BREVO_API_KEY &&
      process.env.EMAIL_FROM
  );

const getSender = () => {
  const rawSender = process.env.EMAIL_FROM?.trim();

  if (!rawSender) {
    return null;
  }

  // Supports:
  // AI Hospital <hospital.management.system001@gmail.com>
  const match = rawSender.match(/^(.*?)\s*<([^<>]+)>$/);

  if (match) {
    return {
      name: match[1].trim() || "AI Hospital",
      email: match[2].trim(),
    };
  }

  // Also supports only:
  // hospital.management.system001@gmail.com
  return {
    name: process.env.EMAIL_FROM_NAME || "AI Hospital",
    email: rawSender,
  };
};

// ================= SEND EMAIL =================

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.error("❌ Email recipient is missing");
    return false;
  }

  if (!isConfigured()) {
    console.error(
      `❌ Brevo API is not configured | To: ${to} | Subject: ${subject}`
    );
    return false;
  }

  const sender = getSender();

  if (!sender?.email) {
    console.error("❌ EMAIL_FROM is invalid");
    return false;
  }

  try {
    console.log("📧 Sending email through Brevo API...");
    console.log({
      from: `${sender.name} <${sender.email}>`,
      to,
      subject,
    });

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender,
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html || undefined,
        textContent: text || undefined,
      }),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("❌ BREVO API ERROR");
      console.error("Status:", response.status);
      console.error("Response:", responseBody);
      return false;
    }

    console.log("✅ Email sent successfully");
    console.log("Message ID:", responseBody?.messageId || "Not returned");

    return true;
  } catch (error) {
    console.error("❌ BREVO API REQUEST FAILED");
    console.error("Message:", error.message);
    console.error("Cause:", error.cause || undefined);

    return false;
  }
};

// ================= EMAIL TEMPLATES =================

const sendTokenGeneratedEmail = (user, token) =>
  sendEmail({
    to: user.email,
    subject: `Token #${token.tokenNumber} Generated - ${token.department}`,
    html: `
      <h2>Your Hospital Token Has Been Generated</h2>
      <p>Hello ${user.name},</p>

      <p>
        Your token <strong>#${token.tokenNumber}</strong> for
        <strong>${token.department}</strong> has been booked successfully.
      </p>

      <p>
        Priority: <strong>${token.priority}</strong>
      </p>

      <p>
        Please check the application for your live queue position and
        estimated waiting time.
      </p>
    `,
  });

const sendDoctorCalledEmail = (user, token) =>
  sendEmail({
    to: user.email,
    subject: `Doctor Has Called You - Token #${token.tokenNumber}`,
    html: `
      <h2>The Doctor Is Ready to See You</h2>
      <p>Hello ${user.name},</p>

      <p>
        Please proceed to the
        <strong>${token.department}</strong> department.
      </p>

      <p>
        Your token <strong>#${token.tokenNumber}</strong> has been called.
      </p>
    `,
  });

const sendAppointmentReminderEmail = (
  user,
  appointment,
  doctorName
) =>
  sendEmail({
    to: user.email,
    subject: `Reminder: Appointment with Dr. ${doctorName}`,
    html: `
      <h2>Appointment Reminder</h2>
      <p>Hello ${user.name},</p>

      <p>This is a reminder for your upcoming appointment:</p>

      <ul>
        <li><strong>Doctor:</strong> Dr. ${doctorName}</li>
        <li><strong>Department:</strong> ${appointment.department}</li>
        <li><strong>Date:</strong> ${appointment.appointmentDate}</li>
        <li><strong>Time:</strong> ${appointment.timeSlot}</li>
      </ul>

      <p>Please arrive 10 minutes early.</p>
    `,
  });

const sendVerificationEmail = (user, verifyUrl) =>
  sendEmail({
    to: user.email,
    subject: "Verify Your Email - AI Hospital",
    html: `
      <h2>Welcome to AI Hospital, ${user.name}!</h2>

      <p>
        Please verify your email address by clicking the button below.
      </p>

      <p>
        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Verify Email
        </a>
      </p>

      <p>If the button does not work, open this link:</p>
      <p>${verifyUrl}</p>

      <p>This verification link expires in 24 hours.</p>
    `,
  });

const sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: "Reset Your Password - AI Hospital",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>

      <p>
        Click the button below to reset your password.
      </p>

      <p>
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Reset Password
        </a>
      </p>

      <p>If the button does not work, open this link:</p>
      <p>${resetUrl}</p>

      <p>This reset link expires in 30 minutes.</p>

      <p>
        If you did not request this password reset, you can ignore this email.
      </p>
    `,
  });

module.exports = {
  sendEmail,
  isConfigured,
  sendTokenGeneratedEmail,
  sendDoctorCalledEmail,
  sendAppointmentReminderEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};