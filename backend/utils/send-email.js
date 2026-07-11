import { Resend } from "resend";
import { RESEND_API_KEY, EMAIL_SENDER } from "../config/env.js";
import { reminderEmailTemplate } from "./email.template.js";

const resend = new Resend(RESEND_API_KEY);

export const sendReminderEmail = async ({ to, userName, subscription, daysLeft }) => {
  const html = reminderEmailTemplate({
    userName,
    subscriptionName: subscription.name,
    renewalDate: subscription.renewalDate.toDateString(),
    amount: subscription.price,
    currency: subscription.currency,
    daysLeft,
  });

  await resend.emails.send({
    from: EMAIL_SENDER,
    to,
    subject: `Reminder: ${subscription.name} renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
    html,
  });
};
