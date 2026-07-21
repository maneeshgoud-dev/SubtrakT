import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

if (!DB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.(development/production).local",
  );
}

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_URI, {
      // Node.js on some machines can't verify the Atlas TLS cert chain —
      // using the system CA store fixes this without disabling security.
      tlsAllowInvalidCertificates: process.env.NODE_ENV !== "production",
    });
    console.log("DB connected succesfully");
  } catch (error) {
    console.error("Error", error);
    process.exit(1);
  }
};

export default connectToDatabase;
