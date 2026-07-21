import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name for this subscription."],
      trim: true,
      minLength: [2, "Subscription name must be at least 2 characters."],
      maxLength: [100, "Subscription name cannot exceed 100 characters."],
    },
    price: {
      type: Number,
      required: [true, "Please enter the subscription price."],
      min: [0, "Price cannot be negative."],
    },
    currency: {
      type: String,
      enum: ["RUP", "USD", "EUR"],
      default: "RUP",
    },
    frequency: {
      type: String,
      enum: { values: ["daily", "monthly", "weekly", "yearly"], message: "Billing frequency must be one of: daily, weekly, monthly, or yearly." },
      required: [true, "Please select a billing frequency."],
    },
    category: {
      type: String,
      enum: {
        values: ["sports", "entertainment", "technology", "finance", "lifestyle", "others"],
        message: "Category must be one of: sports, entertainment, technology, finance, lifestyle, or others.",
      },
      required: [true, "Please select a category."],
    },
    paymentMethod: {
      type: String,
      required: [true, "Please enter a payment method (e.g. Credit Card, UPI)."],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: [true, "Please enter a start date."],
      validate: {
        validator: (value) => {
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return value <= today;
        },
        message: "Start date cannot be in the future. Please enter today's date or an earlier date.",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be after the start date.",
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    remindersSent: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true },
);

// Returns the next renewal date advanced by one billing period (calendar-accurate)
const advanceByFrequency = (date, frequency) => {
  const next = new Date(date);
  switch (frequency) {
    case "daily":   next.setDate(next.getDate() + 1); break;
    case "weekly":  next.setDate(next.getDate() + 7); break;
    case "monthly": next.setMonth(next.getMonth() + 1); break;
    case "yearly":  next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
};

// Keeps advancing until the date is in the future (handles multi-cycle gaps)
const advanceToFuture = (date, frequency) => {
  let next = new Date(date);
  const today = new Date();
  while (next <= today) {
    next = advanceByFrequency(next, frequency);
  }
  return next;
};

export { advanceByFrequency, advanceToFuture };

// Auto-calculation of renewal date if not provided
subscriptionSchema.pre("save", function () {
  if (!this.renewalDate) {
    // BUG 2 FIX: use calendar-accurate arithmetic instead of flat day offsets
    this.renewalDate = advanceByFrequency(this.startDate, this.frequency);
  }

  // Only clear sent reminders when renewalDate is explicitly changed on an
  // existing document (not when it was just auto-computed on first save).
  if (this.isModified("renewalDate") && !this.isNew) {
    this.remindersSent = [];
  }

  // Auto-update the status if renewal date has passed
  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }
});



const Subscriptions = mongoose.model("Subscriptions", subscriptionSchema);

export default Subscriptions;
