import nodemailer from "nodemailer";
import { logger } from "./logger";

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Get or create Nodemailer transporter
 */
function getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
}

/**
 * Send an email or log to console fallback if SMTP is unconfigured
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; simulated?: boolean; messageId?: string }> {
    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"WINA Gateway" <no-reply@${process.env.APP_DOMAIN || "wina.local"}>`;

    if (!transporter) {
        // Console Fallback simulation mode
        console.log("\n" + "=".repeat(70));
        console.log("📧 [EMAIL SIMULATION - SMTP NOT CONFIGURED]");
        console.log(`To:      ${to}`);
        console.log(`Subject: ${subject}`);
        console.log("-".repeat(70));
        if (text) console.log(text);
        console.log("=".repeat(70) + "\n");

        return { success: true, simulated: true };
    }

    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to,
            subject,
            html,
            text: text || subject,
        });

        logger.info("Email", `Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        logger.error("Email", `Failed to send email to ${to}:`, error);
        
        // Log fallback to console so user / dev is not stuck
        console.log("\n" + "!".repeat(70));
        console.log("⚠️ [EMAIL SEND FAILED - FALLBACK CONSOLE LOG]");
        console.log(`To:      ${to}`);
        console.log(`Subject: ${subject}`);
        if (text) console.log(text);
        console.log("!".repeat(70) + "\n");

        return { success: false, simulated: true };
    }
}

/**
 * Send 6-digit OTP & 1-Click Verification Link
 */
export async function sendVerificationEmail(email: string, code: string, token: string, baseUrl?: string): Promise<boolean> {
    const origin = baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = `${origin}/auth/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your WINA Account</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 540px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 36px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .logo { text-align: center; margin-bottom: 24px; font-size: 26px; font-weight: 900; color: #10b981; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 800; color: #f8fafc; margin: 0 0 10px 0; text-align: center; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; text-align: center; }
    .otp-box { background: #020617; border: 2px dashed #10b981; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #34d399; }
    .otp-sub { font-size: 11px; color: #64748b; margin-top: 6px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; padding: 14px 32px; background: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35); }
    .footer { text-align: center; font-size: 11px; color: #475569; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ WINA</div>
    <div style="text-align: center;"><span class="badge">Email Verification</span></div>
    <h1>Verify Your Email Address</h1>
    <p>Welcome to WINA. To complete your account registration and activate full access, please use the 6-digit verification code below or click the instant activation button.</p>
    
    <div class="otp-box">
      <div class="otp-code">${code}</div>
      <div class="otp-sub">Code valid for 15 minutes • Do not share this code with anyone</div>
    </div>

    <div class="btn-container">
      <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Instantly →</a>
    </div>

    <p style="font-size: 12px; color: #64748b;">Or paste this URL into your browser:<br><a href="${verificationUrl}" style="color: #38bdf8; word-break: break-all;">${verificationUrl}</a></p>

    <div class="footer">
      If you did not request this registration, please ignore this email.<br>
      © ${new Date().getFullYear()} WINA Engine. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

    const text = `
⚡ WINA - Email Verification Code
----------------------------------------
Your 6-digit verification code is: ${code}

Or verify directly with this link:
${verificationUrl}

This code expires in 15 minutes.
----------------------------------------
`;

    const result = await sendEmail({
        to: email,
        subject: `[${code}] Verify your WINA account`,
        html,
        text,
    });

    return result.success;
}

/**
 * Send Password Reset Code & Link
 */
export async function sendPasswordResetEmail(email: string, code: string, token: string, baseUrl?: string): Promise<boolean> {
    const origin = baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${origin}/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your WINA Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 540px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 36px 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .logo { text-align: center; margin-bottom: 24px; font-size: 26px; font-weight: 900; color: #f59e0b; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 800; color: #f8fafc; margin: 0 0 10px 0; text-align: center; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; text-align: center; }
    .otp-box { background: #020617; border: 2px dashed #f59e0b; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #fbbf24; }
    .otp-sub { font-size: 11px; color: #64748b; margin-top: 6px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; padding: 14px 32px; background: #f59e0b; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35); }
    .footer { text-align: center; font-size: 11px; color: #475569; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ WINA</div>
    <div style="text-align: center;"><span class="badge">Security & Password Reset</span></div>
    <h1>Reset Your Password</h1>
    <p>A password reset request was received for your WINA operator account. Enter the 6-digit code below or click the reset link to choose a new password.</p>
    
    <div class="otp-box">
      <div class="otp-code">${code}</div>
      <div class="otp-sub">Code valid for 15 minutes • If you didn't request this, ignore this email</div>
    </div>

    <div class="btn-container">
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password Now →</a>
    </div>

    <p style="font-size: 12px; color: #64748b;">Or paste this URL into your browser:<br><a href="${resetUrl}" style="color: #38bdf8; word-break: break-all;">${resetUrl}</a></p>

    <div class="footer">
      Your password will remain unchanged if you do not complete this process.<br>
      © ${new Date().getFullYear()} WINA Engine. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

    const text = `
⚡ WINA - Password Reset Code
----------------------------------------
Your 6-digit reset code is: ${code}

Or reset your password directly at:
${resetUrl}

This code expires in 15 minutes.
----------------------------------------
`;

    const result = await sendEmail({
        to: email,
        subject: `[${code}] Reset your WINA account password`,
        html,
        text,
    });

    return result.success;
}

/**
 * Generate alert email HTML for in-app critical notifications
 */
export function generateAlertEmailHtml(title: string, message: string, href?: string): string {
    const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const targetUrl = href ? (href.startsWith("http") ? href : `${origin}${href}`) : origin;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 540px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 32px 26px; }
    .logo { font-size: 22px; font-weight: 900; color: #10b981; margin-bottom: 16px; }
    h2 { font-size: 18px; font-weight: 800; color: #f8fafc; margin: 0 0 12px 0; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0; }
    .btn { display: inline-block; padding: 12px 24px; background: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px; }
    .footer { font-size: 11px; color: #475569; border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡ WINA Gateway</div>
    <h2>${title}</h2>
    <p>${message}</p>
    ${href ? `<div><a href="${targetUrl}" class="btn">View Details →</a></div>` : ''}
    <div class="footer">
      Automated notification from your WINA WhatsApp instance.<br>
      © ${new Date().getFullYear()} WINA Engine.
    </div>
  </div>
</body>
</html>
`;
}
