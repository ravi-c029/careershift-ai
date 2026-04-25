import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || "CareerShift AI <noreply@careershift.ai>";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your CareerShift AI email",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f0f23;color:#e2e8f0;padding:40px;border-radius:12px;">
        <h1 style="color:#8b5cf6;margin-bottom:8px;">CareerShift AI</h1>
        <h2 style="margin-bottom:16px;">Verify your email, ${name}!</h2>
        <p style="color:#94a3b8;margin-bottom:32px;">Click the button below to verify your email address and start your AI-proof career journey.</p>
        <a href="${url}" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Verify Email</a>
        <p style="color:#64748b;margin-top:32px;font-size:12px;">Link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const url = `${BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your CareerShift AI password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f0f23;color:#e2e8f0;padding:40px;border-radius:12px;">
        <h1 style="color:#8b5cf6;margin-bottom:8px;">CareerShift AI</h1>
        <h2 style="margin-bottom:16px;">Reset your password, ${name}</h2>
        <p style="color:#94a3b8;margin-bottom:32px;">We received a request to reset your password. Click below to set a new one.</p>
        <a href="${url}" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Reset Password</a>
        <p style="color:#64748b;margin-top:32px;font-size:12px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
