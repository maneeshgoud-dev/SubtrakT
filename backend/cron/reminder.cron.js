import cron from "node-cron";
import Subscriptions from "../models/subscription.model.js";
import { advanceToFuture } from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

const REMINDER_DAYS_BY_FREQUENCY = {
  monthly: [7, 3, 1],
  yearly: [30, 7, 3, 1],
  weekly: [3, 1],
  daily: [1],
};

export const getDaysLeft = (renewalDate, timeZone = "Asia/Kolkata") => {
  if (!renewalDate) return null;
  const parsed = new Date(renewalDate);
  if (isNaN(parsed.getTime())) return null;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const todayStr = formatter.format(now);
  const renewalStr = formatter.format(parsed);

  const todayMs = Date.parse(`${todayStr}T00:00:00Z`);
  const renewalMs = Date.parse(`${renewalStr}T00:00:00Z`);

  return Math.round((renewalMs - todayMs) / (1000 * 60 * 60 * 24));
};

export const sendDueReminders = async () => {
  console.log(`[cron] Running sendDueReminders at ${new Date().toISOString()}...`);

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
    if (!subscription.user || !subscription.user.email) {
      continue;
    }

    const daysLeft = getDaysLeft(subscription.renewalDate);

    // Skip subscriptions with missing/invalid renewal dates
    if (daysLeft === null) {
      console.warn(`[cron] Skipping "${subscription.name}" — invalid renewalDate: ${subscription.renewalDate}`);
      continue;
    }

    const reminderDays =
      REMINDER_DAYS_BY_FREQUENCY[subscription.frequency] ?? [7, 3, 1];

    const sortedThresholds = [...reminderDays].sort((a, b) => b - a);

    let thresholdToTrigger = null;
    for (const threshold of sortedThresholds) {
      if (
        daysLeft <= threshold &&
        !subscription.remindersSent.includes(threshold)
      ) {
        thresholdToTrigger = threshold;
        break; // Trigger the highest unfulfilled threshold window
      }
    }

    if (thresholdToTrigger !== null && daysLeft >= 0) {
      try {
        await sendReminderEmail({
          to: subscription.user.email,
          userName: subscription.user.name,
          subscription,
          daysLeft,
        });

        subscription.remindersSent.push(thresholdToTrigger);
        await subscription.save();
        console.log(
          `[cron] Reminder sent to ${subscription.user.email} for "${subscription.name}" (${daysLeft} day(s) left, threshold: ${thresholdToTrigger})`,
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

// Runs once a day at 12:00 AM IST (midnight, Asia/Kolkata)
export const startReminderCron = () => {
  cron.schedule("0 0 * * *", sendDueReminders, { timezone: "Asia/Kolkata" });
  console.log("Reminder cron scheduled — fires daily at 00:00 IST (midnight)");
};

