import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription name is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Price of the subscription should be mentioned"],
      min: [0, "Price must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["RUP", "USD", "EUR"],
      default: "RUP",
    },
    frequency: {
      type: String,
      enum: ["daily", "monthly", "weekly", "yearly"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        "sports",
        "entertainment",
        "technology",
        "finance",
        "lifestyle",
        "others",
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => {
          // Compare by end-of-day so "today" is always a valid start date
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return value <= today;
        },
        message: "Start date must be in the past or today",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "Renewal date must be after the start date",
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

// Auto-calculation of renewal date if not provided
subscriptionSchema.pre("save", function () {
  if (!this.renewalDate) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };
    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency],
    );
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
