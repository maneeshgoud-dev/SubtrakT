import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT, CLIENT_ORIGIN } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { startReminderCron } from "./cron/reminder.cron.js";
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

app.use(errorMiddleware);

// Connect to DB first, then start the server
const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Subscription Tracker API running on http://localhost:${PORT}`);
    startReminderCron();
  });
};

start();

export default app;
