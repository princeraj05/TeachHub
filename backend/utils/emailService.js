const nodemailer = require("nodemailer");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}


const sendOtpEmail = async (email, otp) => {
  const apiKey = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY || process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  let fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  let fromName = process.env.EMAIL_FROM_NAME || "Your School";

  if (process.env.MAIL_FROM) {
    const match = process.env.MAIL_FROM.match(/^(?:"?([^"]*)"?\s)?(?:<(.+)>)?$/);
    if (match) {
      if (match[1]) fromName = match[1].trim();
      if (match[2]) fromEmail = match[2].trim();
    } else {
      fromEmail = process.env.MAIL_FROM;
    }
  }

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

  let provider = (process.env.EMAIL_PROVIDER || "").toLowerCase();
  if (!provider) {
    if (apiKey && apiKey.startsWith("re_")) {
      provider = "resend";
    } else if (process.env.RESEND_API_KEY) {
      provider = "resend";
    } else if (process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY) {
      provider = "brevo";
    }
  }

  // 1. HTTP API (Resend or Brevo)
  if (apiKey && (provider === "resend" || provider === "brevo")) {
    if (provider === "resend") {
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
    } else if (provider === "brevo") {
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
  const service = process.env.EMAIL_SERVICE;
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!service && !host && !user) {
    console.warn("No mail delivery credentials configured (no API keys or SMTP options). Email cannot be delivered.");
    return { success: false, message: "Missing email credentials" };
  }

  let activeHost = host;
  if (!activeHost && service && service.toLowerCase() === "gmail") {
    activeHost = "smtp.gmail.com";
  }

  let resolvedHost = activeHost;
  if (activeHost) {
    try {
      const { address } = await dns.promises.lookup(activeHost, { family: 4 });
      resolvedHost = address;
      console.log(`DNS lookup: resolved ${activeHost} to IPv4 ${resolvedHost}`);
    } catch (dnsErr) {
      console.error(`DNS lookup failed for ${activeHost}, using host string directly:`, dnsErr);
    }
  }

  const getTransporterConfig = (targetHost, targetPort, isSecure) => {
    if (targetHost) {
      return {
        host: targetHost,
        port: targetPort,
        secure: isSecure,
        requireTLS: targetPort === 587,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
          servername: activeHost,
        }
      };
    } else {
      return {
        service,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      };
    }
  };

  const mailOptions = {
    from: `"${fromName}" <${fromEmail || user}>`,
    to: email,
    subject: emailSubject,
    html: emailHtml
  };

  if (process.env.ADMIN_REPLY_TO) {
    mailOptions.replyTo = process.env.ADMIN_REPLY_TO;
  }

  try {
    const isSecure = port === 465;
    const transporterConfig = getTransporterConfig(resolvedHost, port, isSecure);
    const transporter = nodemailer.createTransport(transporterConfig);

    console.log(`Sending verification mail via SMTP ${resolvedHost || service}:${port}...`);
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully via SMTP");
    return { success: true };
  } catch (error) {
    console.warn(`SMTP send failed on ${resolvedHost || service}:${port}:`, error.message);

    // Fallback: if port is 587 try 465, if 465 try 587
    const fallbackPort = port === 587 ? 465 : 587;
    const fallbackSecure = fallbackPort === 465;
    console.log(`Attempting SMTP fallback to port ${fallbackPort} (secure: ${fallbackSecure})...`);

    try {
      const fallbackConfig = getTransporterConfig(resolvedHost, fallbackPort, fallbackSecure);
      const fallbackTransporter = nodemailer.createTransport(fallbackConfig);
      await fallbackTransporter.sendMail(mailOptions);
      console.log(`Email sent successfully via fallback SMTP port ${fallbackPort}`);
      return { success: true };
    } catch (fallbackError) {
      console.error("SMTP fallback also failed:", fallbackError.message);
      return { success: false, message: "SMTP delivery failed" };
    }
  }
};

module.exports = { sendOtpEmail };
