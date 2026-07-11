const nodemailer = require("nodemailer");

let transporter = null;

// ================= CONFIGURATION =================

const isConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
  );

const getTransporter = () => {
  if (!isConfigured()) {
    return null;
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,

      // Port 465 uses direct TLS.
      // Port 587 and 2525 use STARTTLS.
      secure: port === 465,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      requireTLS: port !== 465,

      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    });
  }

  return transporter;
};

// ================= SEND EMAIL =================

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.error("❌ Email recipient is missing");
    return false;
  }

  const currentTransporter = getTransporter();

  if (!currentTransporter) {
    console.error(
      `❌ Brevo SMTP is not configured | To: ${to} | Subject: ${subject}`
    );
    return false;
  }

  try {
    console.log("📧 Sending email through Brevo...");
    console.log({
      from: process.env.EMAIL_FROM,
      to,
      subject,
    });

    const info = await currentTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    });

    console.log("✅ Email sent successfully");
    console.log("Message ID:", info.messageId);

    return true;
  } catch (error) {
    console.error("❌ BREVO EMAIL ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("Response code:", error.responseCode);

    // Recreate the connection on the next email attempt.
    transporter = null;

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
      <p>Priority: <strong>${token.priority}</strong></p>
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
        Please proceed to the <strong>${token.department}</strong> department.
        Your token <strong>#${token.tokenNumber}</strong> has been called.
      </p>
    `,
  });

const sendAppointmentReminderEmail = (user, appointment, doctorName) =>
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
      <p>Please verify your email address by clicking the button below.</p>

      <p>
        <a
          href="${verifyUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #2563eb;
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
      <p>Click the button below to reset your password.</p>

      <p>
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #2563eb;
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
      <p>If you did not request this, you can ignore this email.</p>
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