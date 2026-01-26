/**
 * Email templates with Way Finderz branding
 * Primary purple: #6F2AEC
 * Accent yellow: #F5C842
 * Background cream: #FDF8F3
 */

/**
 * Escape HTML special characters to prevent XSS in email templates
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] ?? char);
}

interface BaseTemplateParams {
  userName?: string;
}

interface VerificationEmailParams extends BaseTemplateParams {
  verifyUrl: string;
}

interface PasswordResetEmailParams extends BaseTemplateParams {
  resetUrl: string;
}

const baseStyles = `
  body {
    font-family: 'Open Sans', Arial, sans-serif;
    line-height: 1.6;
    color: #333333;
    background-color: #FDF8F3;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background-color: #ffffff;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  .header {
    text-align: center;
    margin-bottom: 32px;
  }
  .logo {
    font-size: 32px;
    font-weight: bold;
    color: #6F2AEC;
    margin-bottom: 8px;
  }
  .tagline {
    color: #666666;
    font-size: 14px;
  }
  h1 {
    color: #6F2AEC;
    font-size: 24px;
    margin-bottom: 16px;
    font-weight: 600;
  }
  p {
    margin: 0 0 16px 0;
    color: #555555;
  }
  .button {
    display: inline-block;
    background-color: #F5C842;
    color: #2D005D !important;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    margin: 24px 0;
  }
  .button:hover {
    background-color: #e6b938;
  }
  .button-container {
    text-align: center;
  }
  .link-fallback {
    margin-top: 24px;
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 8px;
    font-size: 12px;
    word-break: break-all;
  }
  .link-fallback p {
    margin: 0 0 8px 0;
    color: #888888;
    font-size: 12px;
  }
  .footer {
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #eeeeee;
    color: #999999;
    font-size: 12px;
  }
  .footer a {
    color: #6F2AEC;
    text-decoration: none;
  }
  .warning {
    background-color: #FFF3CD;
    border: 1px solid #FFEEBA;
    color: #856404;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-top: 24px;
  }
`;

function wrapInLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Way Finderz</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Way Finderz</div>
        <div class="tagline">Learn the language, find your way</div>
      </div>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Way Finderz. All rights reserved.</p>
      <p>This email was sent to you because you have an account with Way Finderz.</p>
    </div>
  </div>
</body>
</html>
`;
}

export function getVerificationEmailTemplate(params: VerificationEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const safeUserName = params.userName ? escapeHtml(params.userName) : null;
  const safeVerifyUrl = escapeHtml(params.verifyUrl);
  const greeting = safeUserName ? `Hi ${safeUserName},` : "Hi there,";

  const html = wrapInLayout(`
    <h1>Verify Your Email</h1>
    <p>${greeting}</p>
    <p>Thanks for signing up for Way Finderz! Please verify your email address to complete your registration and start your language learning journey.</p>
    <div class="button-container">
      <a href="${safeVerifyUrl}" class="button">Verify Email Address</a>
    </div>
    <div class="link-fallback">
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <code>${safeVerifyUrl}</code>
    </div>
    <div class="warning">
      <strong>Note:</strong> This link will expire in 5 days. After that, you'll need to request a new verification email.
    </div>
  `);

  const text = `
Way Finderz - Verify Your Email

${greeting}

Thanks for signing up for Way Finderz! Please verify your email address to complete your registration and start your language learning journey.

Click this link to verify your email:
${params.verifyUrl}

This link will expire in 5 days. After that, you'll need to request a new verification email.

If you didn't create an account with Way Finderz, you can safely ignore this email.

---
Way Finderz - Learn the language, find your way
`;

  return {
    subject: "Verify your email for Way Finderz",
    html,
    text: text.trim(),
  };
}

export function getPasswordResetEmailTemplate(params: PasswordResetEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const safeUserName = params.userName ? escapeHtml(params.userName) : null;
  const safeResetUrl = escapeHtml(params.resetUrl);
  const greeting = safeUserName ? `Hi ${safeUserName},` : "Hi there,";

  const html = wrapInLayout(`
    <h1>Reset Your Password</h1>
    <p>${greeting}</p>
    <p>We received a request to reset your password for your Way Finderz account. Click the button below to create a new password.</p>
    <div class="button-container">
      <a href="${safeResetUrl}" class="button">Reset Password</a>
    </div>
    <div class="link-fallback">
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <code>${safeResetUrl}</code>
    </div>
    <div class="warning">
      <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, you can safely ignore this email.
    </div>
  `);

  const text = `
Way Finderz - Reset Your Password

${greeting}

We received a request to reset your password for your Way Finderz account.

Click this link to reset your password:
${params.resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

---
Way Finderz - Learn the language, find your way
`;

  return {
    subject: "Reset your password for Way Finderz",
    html,
    text: text.trim(),
  };
}
