const nodemailer = require("nodemailer");

const sendOtpEmail = async (email, otp) => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.log("\n========================================================");
    console.log(`🔑 DEVELOPMENT MODE: EMAIL OTP FOR ${email} IS: ${otp}`);
    console.log("========================================================\n");
    return {
      success: true,
      development: true,
      message: "Development Mode: OTP logged to console."
    };
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
    };

    if (host && host.includes("gmail.com")) {
      delete transporterOptions.host;
      delete transporterOptions.port;
      delete transporterOptions.secure;
      transporterOptions.service = "gmail";
    }

    const transporter = nodemailer.createTransport(transporterOptions);

    const mailOptions = {
      from: `"TeachHub Portal" <${user}>`,
      to: email,
      subject: "Your TeachHub Authentication OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #7C3AED; text-align: center;">TeachHub Portal</h2>
          <p>Hello,</p>
          <p>We received a request to log in to your TeachHub account. Use the following One-Time Password (OTP) to complete your authentication:</p>
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #1e293b; margin: 20px 0; letter-spacing: 4px;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 12px;">This OTP is valid for 5 minutes. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return {
      success: true,
      development: false,
      message: "Email sent successfully"
    };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    console.log("\n========================================================");
    console.log(`⚠️ SMTP SEND FAILED. FALLBACK OTP FOR ${email} IS: ${otp}`);
    console.log("========================================================\n");
    return {
      success: true,
      development: true,
      message: `SMTP failed: ${error.message}. OTP logged to console.`
    };
  }
};

module.exports = { sendOtpEmail };
