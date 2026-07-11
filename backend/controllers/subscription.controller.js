import Subscriptions from "../models/subscription.model.js";

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

  if (!subscription) {
    const error = new Error("Subscription not found");
    error.statusCode = 404;
    throw error;
  }

  if (subscription.user.toString() !== userId) {
    const error = new Error("You are not authorized to access this subscription");
    error.statusCode = 403;
    throw error;
  }

  return subscription;
};

export const createSubscription = async (req, res, next) => {
  try {
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
