import { config } from "dotenv";

// Load local env file in development; in production env vars come from the platform directly
if (process.env.NODE_ENV !== "production") {
  config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });
}

export const {
  PORT,
  NODE_ENV,
  DB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  CLIENT_ORIGIN,
  CRON_SECRET,
} = process.env;

// Hard-required — server cannot function without these
const requiredEnvVars = { DB_URI, JWT_SECRET, JWT_EXPIRES_IN };

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Soft-required — warn but don't crash (emails will silently fail without these)
const warnEnvVars = { GMAIL_USER, GMAIL_APP_PASSWORD };
Object.entries(warnEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(`[env] WARNING: ${key} is not set — reminder emails will not work.`);
  }
});
