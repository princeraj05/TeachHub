const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY || process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const fromName = process.env.EMAIL_FROM_NAME || "Your School";

  const emailSubject = "Your School - Login Verification Code";
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #7C3AED; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.025em;">Your School</h2>
        <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">Authentication Service</p>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hello,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">We received a request to log in to your <strong>Your School</strong> account. Use the verification code below to complete your sign-in:</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: 800; color: #0f172a; margin: 24px 0; letter-spacing: 6px; font-family: monospace;">
        ${otp}
      </div>
      <p style="color: #ef4444; font-size: 13px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">This code is confidential and will expire in 5 minutes.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0; text-align: center;">If you did not request this code, you can safely ignore this email. Please do not share this verification code with anyone.</p>
    </div>
  `;

  // 1. HTTP API (Resend or Brevo)
  if (apiKey) {
    const isResend = apiKey.startsWith("re_") || process.env.RESEND_API_KEY;
    if (isResend) {
      try {
        console.log("Sending verification email via Resend HTTP API...");
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: email,
            subject: emailSubject,
            html: emailHtml
          })
        });
        if (response.ok) {
          console.log("Email sent successfully via Resend API");
          return { success: true };
        } else {
          const errText = await response.text();
          console.error("Resend API error response:", errText);
        }
      } catch (apiError) {
        console.error("Resend API call failed:", apiError);
      }
    } else {
      // Brevo API
      try {
        console.log("Sending verification email via Brevo HTTP API...");
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sender: { name: fromName, email: fromEmail },
            to: [{ email: email }],
            subject: emailSubject,
            htmlContent: emailHtml
          })
        });
        if (response.ok) {
          console.log("Email sent successfully via Brevo API");
          return { success: true };
        } else {
          const errText = await response.text();
          console.error("Brevo API error response:", errText);
        }
      } catch (apiError) {
        console.error("Brevo API call failed:", apiError);
      }
    }
  }

  // 2. SMTP fallback
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.warn("No mail delivery credentials configured (no API keys or SMTP options). Email cannot be delivered.");
    return { success: false, message: "Missing email credentials" };
  }

  try {
    const transporterOptions = {
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: {
        user,
        pass,
      },
      family: 4,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    };

    if (host.includes("gmail.com")) {
      delete transporterOptions.host;
      delete transporterOptions.port;
      delete transporterOptions.secure;
      transporterOptions.service = "gmail";
    }

    const transporter = nodemailer.createTransport(transporterOptions);
    const mailOptions = {
      from: `"${fromName}" <${user}>`,
      to: email,
      subject: emailSubject,
      html: emailHtml
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully via SMTP");
    return { success: true };
  } catch (error) {
    console.error("SMTP delivery failed:", error.message);
    return { success: false, message: "SMTP delivery failed" };
  }
};

module.exports = { sendOtpEmail };
