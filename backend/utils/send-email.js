import nodemailer from "nodemailer";
import { GMAIL_USER, GMAIL_APP_PASSWORD, NODE_ENV } from "../config/env.js";
import { reminderEmailTemplate } from "./email.template.js";

// Gmail transporter using an App Password.
// No domain verification needed — emails send from your Gmail account.
// TLS strict mode is on in production (Render has proper certs).
// On local dev (Windows), cert chain verification is relaxed to avoid the
// "self-signed certificate" error caused by the machine's Node.js setup.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // STARTTLS
  family: 4,     // Force IPv4 — Render's free tier doesn't support outbound IPv6
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD, // 16-char App Password (no spaces)
  },
  tls: {
    rejectUnauthorized: NODE_ENV === "production",
  },
});

export const sendReminderEmail = async ({ to, userName, subscription, daysLeft }) => {
  const html = reminderEmailTemplate({
    userName,
    subscriptionName: subscription.name,
    renewalDate: new Date(subscription.renewalDate).toDateString(),
    amount: subscription.price,
    currency: subscription.currency,
    daysLeft,
  });

  await transporter.sendMail({
    from: `"SubTrackt" <${GMAIL_USER}>`,
    to,
    subject: `⏰ Reminder: ${subscription.name} renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
    html,
  });
};
