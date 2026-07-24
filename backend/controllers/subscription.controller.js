import Subscriptions from "../models/subscription.model.js";
import { advanceToFuture } from "../models/subscription.model.js";

const subscriptionFields = [
  "name",
  "price",
  "currency",
  "frequency",
  "category",
  "paymentMethod",
  "status",
  "startDate",
  "renewalDate",
];

const getAllowedSubscriptionUpdates = (body) =>
  subscriptionFields.reduce((updates, field) => {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }

    return updates;
  }, {});

const findOwnedSubscription = async (subscriptionId, userId) => {
  const subscription = await Subscriptions.findById(subscriptionId);

  if (!subscription || !subscription.user) {
    const error = new Error("Subscription not found. It may have already been deleted.");
    error.statusCode = 404;
    throw error;
  }

  if (subscription.user.toString() !== userId) {
    const error = new Error("You do not have permission to access this subscription.");
    error.statusCode = 403;
    throw error;
  }

  return subscription;
};

export const createSubscription = async (req, res, next) => {
  try {
    const { name, price, frequency, category, paymentMethod, startDate } = req.body;
    const missing = [];
    if (!name) missing.push("name");
    if (price === undefined || price === "") missing.push("price");
    if (!frequency) missing.push("frequency");
    if (!category) missing.push("category");
    if (!paymentMethod) missing.push("payment method");
    if (!startDate) missing.push("start date");

    if (missing.length > 0) {
      const error = new Error(`Please fill in the following required fields: ${missing.join(", ")}.`);
      error.statusCode = 400;
      throw error;
    }

    const subscription = await Subscriptions.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptions = async (req, res, next) => {
  try {
    // Auto-advance any past-due active subscriptions immediately so the UI
    // always shows correct future dates without waiting for the 9 AM cron.
    const stale = await Subscriptions.find({
      user: req.user._id,
      status: "active",
      renewalDate: { $lt: new Date() },
    });

    for (const sub of stale) {
      sub.renewalDate = advanceToFuture(sub.renewalDate, sub.frequency);
      await sub.save();
    }

    const subscriptions = await Subscriptions.find({ user: req.user._id }).sort({
      renewalDate: 1,
    });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await findOwnedSubscription(req.params.id, req.user.id);

    // Auto-advance if past-due and still marked active
    if (subscription.status === "active" && subscription.renewalDate < new Date()) {
      subscription.renewalDate = advanceToFuture(subscription.renewalDate, subscription.frequency);
      await subscription.save();
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await findOwnedSubscription(req.params.id, req.user.id);
    const updates = getAllowedSubscriptionUpdates(req.body);

    if (
      updates.renewalDate === undefined &&
      (updates.startDate !== undefined || updates.frequency !== undefined)
    ) {
      subscription.renewalDate = undefined;
    }

    Object.assign(subscription, updates);
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await findOwnedSubscription(req.params.id, req.user.id);

    await subscription.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await findOwnedSubscription(req.params.id, req.user.id);

    subscription.status = "cancelled";
    await subscription.save();

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 7;
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    const subscriptions = await Subscriptions.find({
      user: req.user._id,
      status: "active",
      renewalDate: { $gte: today, $lte: endDate },
    }).sort({ renewalDate: 1 });

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};
