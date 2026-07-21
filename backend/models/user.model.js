import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name."],
      trim: true,
      minLength: [3, "Name must be at least 3 characters."],
      maxLength: [50, "Name cannot exceed 50 characters."],
    },
    email: {
      type: String,
      required: [true, "Please enter your email address."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address (e.g. jane@example.com)."],
    },
    password: {
      type: String,
      required: [true, "Please enter a password."],
      minLength: [5, "Password must be at least 5 characters."],
      maxLength: [100, "Password cannot exceed 100 characters."],
      select: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
