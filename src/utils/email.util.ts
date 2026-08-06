import nodemailer from "nodemailer";

// Create reusable transporter using SMTP credentials from environment
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export interface DutyEmailPayload {
  toEmail: string;
  toName: string;
  date: string;        // e.g. "2026-08-07"
  messName?: string;
}

export const sendDutyAssignmentEmail = async (payload: DutyEmailPayload): Promise<void> => {
  const { toEmail, toName, date, messName } = payload;

  // Only send if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MAIL] Email not configured. Skipping duty email to ${toEmail}`);
    return;
  }

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const transporter = createTransporter();

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Market Duty Assignment</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#184534 0%,#0f2e22 100%);padding:36px 40px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">🛒</div>
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0;letter-spacing:-0.5px;">
                Market Duty Assigned!
              </h1>
              <p style="color:#a7f3d0;font-size:13px;margin:8px 0 0;">
                ${messName ? messName + " Mess" : "Your Mess Group"}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="font-size:16px;color:#334155;margin:0 0 20px;">
                Hello <strong style="color:#184534;">${toName}</strong>,
              </p>
              <p style="font-size:15px;color:#475569;margin:0 0 28px;line-height:1.6;">
                You have been assigned <strong>Bazaar (Market) Duty</strong> by your Mess Manager.
                Please go to the market and collect all groceries and daily essentials for the mess on this date.
              </p>

              <!-- Duty Date Card -->
              <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
                <p style="font-size:11px;font-weight:800;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">
                  📅 YOUR DUTY DATE
                </p>
                <h2 style="font-size:26px;font-weight:800;color:#14532d;margin:0;">
                  ${formattedDate}
                </h2>
              </div>

              <!-- What to do -->
              <div style="background:#fafafa;border-radius:14px;padding:20px 24px;margin-bottom:28px;">
                <p style="font-size:12px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 12px;">
                  📋 What you need to do:
                </p>
                <ul style="margin:0;padding-left:18px;color:#475569;font-size:14px;line-height:2;">
                  <li>Visit the local market on your assigned date</li>
                  <li>Buy all daily groceries, vegetables &amp; essentials</li>
                  <li>Keep all receipts for expense logging</li>
                  <li>Log your total bazaar cost in the Mess Manager app after shopping</li>
                </ul>
              </div>

              <p style="font-size:13px;color:#94a3b8;margin:0;line-height:1.6;">
                If you have any issues or cannot complete this duty, please contact your Mess Manager immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="font-size:12px;color:#94a3b8;margin:0;">
                Sent automatically by <strong style="color:#184534;">Meal Manager</strong> &bull; Do not reply to this email
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Meal Manager 🍽️" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🛒 Market Duty Assigned — ${formattedDate}`,
    html: htmlBody,
    text: `Hello ${toName},\n\nYou have been assigned Market Duty on ${formattedDate}.\n\nPlease visit the market and purchase all daily groceries for the mess. Keep all receipts and log your bazaar cost in the Meal Manager app after shopping.\n\n— Meal Manager`,
  });

  console.log(`[MAIL] ✅ Duty assignment email sent to ${toEmail} for ${date}`);
};
