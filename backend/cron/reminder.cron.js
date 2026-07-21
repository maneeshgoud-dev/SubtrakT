import cron from "node-cron";
import Subscriptions from "../models/subscription.model.js";
import { advanceToFuture } from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

const REMINDER_DAYS_BY_FREQUENCY = {
  monthly: [7, 3, 1],
  yearly: [7, 3, 1],
  weekly: [3, 1],
  daily: [1],
};

const getDaysLeft = (renewalDate) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewal = new Date(renewalDate);
  renewal.setHours(0, 0, 0, 0);
  return Math.round((renewal - today) / msPerDay);
};

export const sendDueReminders = async () => {
  // STEP 1: Advance any overdue renewalDates FIRST so the pre-save hook can
  // reset remindersSent and re-set the status to "active" before we query.
  // This prevents subscriptions from being stuck as "expired" and skipped.
  const overdueSubscriptions = await Subscriptions.find({
    status: { $in: ["active", "expired"] },
    renewalDate: { $lt: new Date() },
  });

  for (const subscription of overdueSubscriptions) {
    try {
      subscription.renewalDate = advanceToFuture(
        subscription.renewalDate,
        subscription.frequency,
      );
      // Force status back to active after advancing the date
      subscription.status = "active";
      await subscription.save();
    } catch (error) {
      console.error(
        `Failed to auto-advance renewal for subscription ${subscription._id}:`,
        error.message,
      );
    }
  }

  // STEP 2: Now fetch all active subscriptions and send due reminders.
  const subscriptions = await Subscriptions.find({ status: "active" }).populate(
    "user",
    "name email",
  );

  for (const subscription of subscriptions) {
    const daysLeft = getDaysLeft(subscription.renewalDate);

    const reminderDays =
      REMINDER_DAYS_BY_FREQUENCY[subscription.frequency] ?? [7, 3, 1];

    if (
      reminderDays.includes(daysLeft) &&
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
        console.log(
          `Reminder sent to ${subscription.user.email} for "${subscription.name}" (${daysLeft} day(s) left)`,
        );
      } catch (error) {
        console.error(
          `Failed to send reminder for subscription ${subscription._id}:`,
          error.message,
        );
      }
    }
  }
};

// Runs once a day at 9:00 AM IST (Asia/Kolkata)
export const startReminderCron = () => {
  cron.schedule("0 9 * * *", sendDueReminders, { timezone: "Asia/Kolkata" });
  console.log("Reminder cron scheduled — fires daily at 09:00 IST");
};
