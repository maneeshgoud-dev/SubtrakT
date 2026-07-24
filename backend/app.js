import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT, CLIENT_ORIGIN, CRON_SECRET, NODE_ENV } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { startReminderCron, sendDueReminders } from "./cron/reminder.cron.js";
import authRouter from "./routes/auth.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  ...(CLIENT_ORIGIN ? [CLIENT_ORIGIN] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Subscription Tracker API");
});

// ⚠️  Dev-only: manually fire the reminder cron for testing
if (process.env.NODE_ENV !== "production") {
  app.post("/api/v1/test/send-reminders", async (req, res) => {
    try {
      await sendDueReminders();
      res.json({ success: true, message: "Reminder emails triggered successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

// Protected cron trigger — callable from cron-job.org or Render cron jobs.
// Requires the X-Cron-Secret header to match the CRON_SECRET env var.
app.post("/api/v1/cron/send-reminders", async (req, res) => {
  const secret = req.headers["x-cron-secret"];
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Respond immediately so external cron triggers (e.g. cron-job.org) don't timeout
  // while nodemailer/SMTP sends emails in the background.
  res.status(200).json({
    success: true,
    message: "Reminder job triggered successfully",
  });

  // Execute reminder processing asynchronously
  sendDueReminders().catch((error) => {
    console.error("Error executing sendDueReminders cron job:", error);
  });
});

app.use(errorMiddleware);

// Connect to DB first, then start the server
const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Subscription Tracker API running on http://localhost:${PORT}`);
    startReminderCron();

    // Keep the Render free-tier server alive by self-pinging every 14 minutes.
    // Render spins down free services after 15 min of inactivity, which would
    // kill the node-cron so the 9 AM reminder would never fire.
    if (NODE_ENV === "production") {
      const SELF_URL = `https://subtrakt.onrender.com/`;
      setInterval(async () => {
        try {
          await fetch(SELF_URL);
          console.log("[keep-alive] pinged self");
        } catch (e) {
          console.warn("[keep-alive] ping failed:", e.message);
        }
      }, 14 * 60 * 1000); // every 14 minutes
    }
  });
};

start();

export default app;
