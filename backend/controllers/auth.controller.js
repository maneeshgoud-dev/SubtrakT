import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import jwt from "jsonwebtoken";

const createToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const sanitizeUser = (user) => {
  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new Error("Name, email and password are all required to create an account.");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      const error = new Error(`An account with the email "${email}" already exists. Try signing in instead.`);
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(newUser._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: sanitizeUser(newUser),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      const error = new Error(`No account found with the email "${email}". Check the email address or create a new account.`);
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("Incorrect password. Please try again.");
      error.statusCode = 401;
      throw error;
    }

    const token = createToken(user._id);

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        token,
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User signed out successfully",
  });
};
