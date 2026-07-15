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
  RESEND_API_KEY,
  EMAIL_SENDER,
  CLIENT_ORIGIN,
} = process.env;

const requiredEnvVars = { DB_URI, JWT_SECRET, JWT_EXPIRES_IN };

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
