export type LeadNotificationPayload = {
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  source?: string;
  verified?: boolean;
  timestamp: string;
  userId?: string;
  exportCount?: number;
  event?: "signup" | "export";
};

export async function sendAdminLeadNotification(payload: LeadNotificationPayload) {
  const adminEmail = process.env.LEAD_NOTIFICATION_EMAIL ?? "Abdullahalshawadfy410@gmail.com";
  const fromEmail = process.env.LEAD_NOTIFICATION_FROM ?? "no-reply@pharma-dashboard.com";
  const sendgridKey = process.env.SENDGRID_API_KEY;

  const subject =
    payload.event === "export"
      ? `Pharma Dashboard Export Notification: ${payload.fullName}`
      : `New Pharma Dashboard Lead Registered: ${payload.fullName}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111;">
      <h2>${payload.event === "export" ? "Dashboard Export Activity" : "New Lead Registration"}</h2>
      <p><strong>Name:</strong> ${payload.fullName}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Company:</strong> ${payload.company ?? "Not provided"}</p>
      <p><strong>Phone:</strong> ${payload.phone ?? "Not provided"}</p>
      <p><strong>Source:</strong> ${payload.source ?? "Website signup"}</p>
      <p><strong>Email verified:</strong> ${payload.verified ? "Yes" : "No"}</p>
      <p><strong>Timestamp:</strong> ${payload.timestamp}</p>
      <p><strong>Export count:</strong> ${payload.exportCount ?? 0}</p>
      <p><strong>Event:</strong> ${payload.event ?? "signup"}</p>
    </div>
  `;

  if (!sendgridKey) {
    console.warn("SENDGRID_API_KEY is not configured. Admin lead notification skipped.", { adminEmail, payload });
    return;
  }

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendgridKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: adminEmail }],
          subject
        }
      ],
      from: {
        email: fromEmail,
        name: "Pharma Dashboard Lead Notifications"
      },
      content: [
        {
          type: "text/plain",
          value: `Name: ${payload.fullName}\nEmail: ${payload.email}\nCompany: ${payload.company ?? "Not provided"}\nPhone: ${payload.phone ?? "Not provided"}\nSource: ${payload.source ?? "Website signup"}\nEmail verified: ${payload.verified ? "Yes" : "No"}\nRegistration timestamp: ${payload.timestamp}\nExport activity: ${payload.exportCount ?? 0}\nEvent: ${payload.event ?? "signup"}`
        },
        {
          type: "text/html",
          value: html
        }
      ]
    })
  });
}
