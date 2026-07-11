import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getSubscription,
  getSubscriptions,
  getUpcomingRenewals,
  updateSubscription,
} from "../controllers/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.use(authorize);

subscriptionRouter.get("/", getSubscriptions);
subscriptionRouter.post("/", createSubscription);
subscriptionRouter.get("/upcoming-renewals", getUpcomingRenewals);
subscriptionRouter.get("/:id", getSubscription);
subscriptionRouter.put("/:id", updateSubscription);
subscriptionRouter.delete("/:id", deleteSubscription);
subscriptionRouter.put("/:id/cancel", cancelSubscription);

export default subscriptionRouter;
