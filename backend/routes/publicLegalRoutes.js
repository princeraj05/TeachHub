const express = require("express");
const router = express.Router();

const commonStyle = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #202124;
    background-color: #f8f9fa;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 840px;
    margin: 40px auto;
    background: #ffffff;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid #e0e0e0;
  }
  h1 { color: #1a73e8; margin-top: 0; font-size: 28px; }
  h2 { color: #1f2937; margin-top: 28px; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; }
  p, li { font-size: 15px; color: #4b5563; }
  ul { padding-left: 20px; }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    background-color: #e8f0fe;
    color: #1a73e8;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 20px;
  }
  .footer-links {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    font-size: 14px;
    color: #6b7280;
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }
  .footer-links a {
    color: #1a73e8;
    text-decoration: none;
  }
  .footer-links a:hover {
    text-decoration: underline;
  }
  .form-group {
    margin-bottom: 20px;
  }
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 6px;
    color: #374151;
    font-size: 14px;
  }
  input, select, textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 15px;
    box-sizing: border-box;
    font-family: inherit;
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.15);
  }
  button {
    background-color: #dc2626;
    color: #ffffff;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  button:hover {
    background-color: #b91c1c;
  }
  .alert {
    padding: 14px 18px;
    border-radius: 6px;
    margin-top: 20px;
    display: none;
    font-size: 15px;
  }
  .alert-success {
    background-color: #def7ec;
    color: #03543f;
    border: 1px solid #84e1bc;
  }
  .alert-error {
    background-color: #fde8e8;
    color: #9b1c1c;
    border: 1px solid #f8b4b4;
  }
`;

const footerHtml = `
  <div class="footer-links">
    <a href="/privacy-policy">Privacy Policy</a>
    <a href="/terms-of-service">Terms of Service</a>
    <a href="/cookie-policy">Cookie Policy</a>
    <a href="/disclaimer">Disclaimer</a>
    <a href="/refund-policy">Refund Policy</a>
    <a href="/about-us">About Us</a>
    <a href="/delete-account">Account Deletion</a>
  </div>
`;

// Terms of Service
router.get("/terms-of-service", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - TeachHub (Your School)</title>
  <style>${commonStyle}</style>
</head>
<body>
  <div class="container">
    <span class="badge">Legal Document</span>
    <h1>Terms of Service</h1>
    <p>Effective Date: September 10, 2026</p>
    <p>Welcome to TeachHub ("Your School"). By accessing or using our mobile application and web services, you agree to be bound by these Terms of Service.</p>

    <h2>1. Acceptance of Terms</h2>
    <p>By using TeachHub, you agree to comply with all rules and regulations established by your institution and our platform services.</p>

    <h2>2. User Accounts & Responsibilities</h2>
    <p>Users (Admins, Teachers, Students, Parents) must provide accurate information and maintain the confidentiality of their credentials. You are responsible for all activities occurring under your account.</p>

    <h2>3. Acceptable Use Policy</h2>
    <p>You agree not to upload harmful content, disrupt services, engage in unauthorized access, or misuse educational materials published on TeachHub.</p>

    <h2>4. Service Availability & Modifications</h2>
    <p>We strive for uninterrupted platform access but reserve the right to perform scheduled maintenance, updates, or feature enhancements.</p>

    <h2>5. Termination</h2>
    <p>We reserve the right to suspend or terminate accounts that violate platform policies or academic guidelines established by partner institutions.</p>

    <h2>6. Contact Information</h2>
    <p>For questions regarding these terms, contact us at: <strong>princerajmne@gmail.com</strong></p>
    ${footerHtml}
  </div>
</body>
</html>`);
});

// Cookie Policy
router.get("/cookie-policy", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cookie Policy - TeachHub (Your School)</title>
  <style>${commonStyle}</style>
</head>
<body>
  <div class="container">
    <span class="badge">Privacy Policy Annex</span>
    <h1>Cookie Policy</h1>
    <p>Effective Date: September 10, 2026</p>
    <p>TeachHub uses essential session markers and cookies to ensure seamless access to your school account.</p>

    <h2>1. What Are Cookies?</h2>
    <p>Cookies are small text tokens stored on your device to keep you signed in securely and personalize your app experience.</p>

    <h2>2. Essential Cookies We Use</h2>
    <ul>
      <li><strong>Authentication Tokens (JWT):</strong> Maintained securely to keep your session active across tabs.</li>
      <li><strong>Preference Cookies:</strong> Store theme preferences (Dark/Light mode) and language selections.</li>
    </ul>

    <h2>3. Managing Preferences</h2>
    <p>Since TeachHub relies on secure tokens for essential functionality (like attendance and chat), clearing browser cookies will log you out of active sessions.</p>

    <h2>4. Contact</h2>
    <p>For cookie inquiry details: <strong>princerajmne@gmail.com</strong></p>
    ${footerHtml}
  </div>
</body>
</html>`);
});

// Disclaimer
router.get("/disclaimer", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Disclaimer - TeachHub (Your School)</title>
  <style>${commonStyle}</style>
</head>
<body>
  <div class="container">
    <span class="badge">Legal Notice</span>
    <h1>Disclaimer</h1>
    <p>Effective Date: September 10, 2026</p>

    <h2>1. General Information</h2>
    <p>The information provided by TeachHub ("Your School") is for general educational and administrative support purposes only. All academic records, grades, and attendance data are managed directly by affiliated school administrators.</p>

    <h2>2. Limitation of Liability</h2>
    <p>TeachHub is not liable for errors or omissions in content posted by individual school staff or institution representatives using our software platform.</p>

    <h2>3. External Services</h2>
    <p>Our platform may integrate with third-party tools (such as video communication or payment processing). We are not responsible for third-party privacy policies or technical downtime beyond our control.</p>

    <h2>4. Contact Us</h2>
    <p>Questions? Reach out to: <strong>princerajmne@gmail.com</strong></p>
    ${footerHtml}
  </div>
</body>
</html>`);
});

// Refund Policy
router.get("/refund-policy", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Policy - TeachHub (Your School)</title>
  <style>${commonStyle}</style>
</head>
<body>
  <div class="container">
    <span class="badge">Financial Policy</span>
    <h1>Refund Policy</h1>
    <p>Effective Date: September 10, 2026</p>

    <h2>1. School Fee Payments</h2>
    <p>School fees, tuition charges, and academic deposits processed through TeachHub are directly managed by your respective educational institution.</p>

    <h2>2. Refund Eligibility</h2>
    <p>Requests for refunds regarding school fees or registration fees must be addressed directly to your school's administration or accounts department according to institutional policies.</p>

    <h2>3. Subscription Services</h2>
    <p>Institutional SaaS subscription plans for schools are governed by the specific Service Level Agreement (SLA) signed between TeachHub and the partner institution.</p>

    <h2>4. Assistance</h2>
    <p>For payment verification assistance, email: <strong>princerajmne@gmail.com</strong></p>
    ${footerHtml}
  </div>
</body>
</html>`);
});

// About Us
router.get("/about-us", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us - TeachHub (Your School)</title>
  <style>${commonStyle}</style>
</head>
<body>
  <div class="container">
    <span class="badge">Our Vision</span>
    <h1>About TeachHub (Your School)</h1>
    <p>TeachHub is a unified school management and smart learning ecosystem built to bridge the gap between administrators, teachers, students, and parents.</p>

    <h2>Our Mission</h2>
    <p>Our goal is to digitize institution management through real-time attendance, smooth communication, exam grading, instant notifications, and customized administrative control for schools of all sizes.</p>

    <h2>Key Capabilities</h2>
    <ul>
      <li>Complete Student & Staff Record Management</li>
      <li>Instant Attendance Roster & Class Reporting</li>
      <li>In-App Notifications & Live Communication</li>
      <li>Seamless Timetable & Exam Management</li>
    </ul>

    <h2>Get In Touch</h2>
    <p>For partnerships or technical inquiries, email: <strong>princerajmne@gmail.com</strong></p>
    ${footerHtml}
  </div>
</body>
</html>`);
});

// Account Deletion Request Page (Google Play Compliance)
router.get("/delete-account", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deletion Request - TeachHub (Your School)</title>
  <style>${commonStyle}</style>
</head>
<body>
  <div class="container">
    <span class="badge" style="background-color: #fee2e2; color: #dc2626;">Data Privacy & Compliance</span>
    <h1>Account & Data Deletion Request</h1>
    <p>In accordance with Google Play Developer Policies and data protection regulations, users of <strong>TeachHub / Your School</strong> have the right to request the complete deletion of their user account and associated personal data.</p>

    <h2>What Happens When You Request Deletion?</h2>
    <ul>
      <li>Your personal profile (name, email, login credentials, phone number) will be permanently deleted or anonymized.</li>
      <li>Your associated session tokens, device notifications, and app preferences will be wiped.</li>
      <li>Academic records required for institutional auditing may be retained by your school administrator in accordance with legal and educational policy requirements.</li>
    </ul>

    <h2>Submit Deletion Request</h2>
    <p>Please fill out the form below to submit an official account deletion request. You will receive a confirmation response once your request is processed by our data privacy team.</p>

    <form id="deletionForm">
      <div class="form-group">
        <label for="email">Account Email Address *</label>
        <input type="email" id="email" name="email" placeholder="student@school.com or teacher@school.com" required>
      </div>

      <div class="form-group">
        <label for="name">Full Name</label>
        <input type="text" id="name" name="name" placeholder="Enter your registered full name">
      </div>

      <div class="form-group">
        <label for="role">User Role</label>
        <select id="role" name="role">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">School Admin</option>
          <option value="other">Other / Parent</option>
        </select>
      </div>

      <div class="form-group">
        <label for="schoolName">School Name</label>
        <input type="text" id="schoolName" name="schoolName" placeholder="Enter your school name">
      </div>

      <div class="form-group">
        <label for="reason">Reason for Deletion (Optional)</label>
        <textarea id="reason" name="reason" rows="3" placeholder="Tell us why you are leaving or requesting data deletion..."></textarea>
      </div>

      <button type="submit" id="submitBtn">Submit Account Deletion Request</button>
    </form>

    <div id="alertSuccess" class="alert alert-success"></div>
    <div id="alertError" class="alert alert-error"></div>

    ${footerHtml}
  </div>

  <script>
    document.getElementById('deletionForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      const submitBtn = document.getElementById('submitBtn');
      const alertSuccess = document.getElementById('alertSuccess');
      const alertError = document.getElementById('alertError');
      
      alertSuccess.style.display = 'none';
      alertError.style.display = 'none';

      const payload = {
        email: document.getElementById('email').value.trim(),
        name: document.getElementById('name').value.trim(),
        role: document.getElementById('role').value,
        schoolName: document.getElementById('schoolName').value.trim(),
        reason: document.getElementById('reason').value.trim()
      };

      if (!payload.email) {
        alertError.textContent = 'Please enter a valid email address.';
        alertError.style.display = 'block';
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';

        const res = await fetch('/api/account-deletion-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          alertSuccess.innerHTML = '<strong>Request Submitted Successfully!</strong><br>' + data.message;
          alertSuccess.style.display = 'block';
          document.getElementById('deletionForm').reset();
        } else {
          alertError.textContent = data.message || 'Failed to submit deletion request. Please try again.';
          alertError.style.display = 'block';
        }
      } catch (err) {
        alertError.textContent = 'A network error occurred. Please check your connection and try again.';
        alertError.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Account Deletion Request';
      }
    });
  </script>
</body>
</html>`);
});

module.exports = router;
