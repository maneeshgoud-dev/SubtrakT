import cron from "node-cron";
import Subscriptions from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

const REMINDER_DAYS = [7, 3, 1];

const getDaysLeft = (renewalDate) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = new Date(renewalDate);
  renewal.setHours(0, 0, 0, 0);
  return Math.round((renewal - today) / msPerDay);
};

const sendDueReminders = async () => {
  const subscriptions = await Subscriptions.find({ status: "active" }).populate(
    "user",
    "name email",
  );

  for (const subscription of subscriptions) {
    const daysLeft = getDaysLeft(subscription.renewalDate);

    if (
      REMINDER_DAYS.includes(daysLeft) &&
      !subscription.remindersSent.includes(daysLeft)
    ) {
      try {
        await sendReminderEmail({
          to: subscription.user.email,
          userName: subscription.user.name,
          subscription,
          daysLeft,
        });

        subscription.remindersSent.push(daysLeft);
        await subscription.save();
      } catch (error) {
        console.error(
          `Failed to send reminder for subscription ${subscription._id}:`,
          error.message,
        );
      }
    }
  }
};

// Runs once a day at 9:00 AM
export const startReminderCron = () => {
  cron.schedule("0 9 * * *", sendDueReminders);
};
