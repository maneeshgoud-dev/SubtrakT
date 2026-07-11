import api from "./axios";

export const getSubscriptions = () => api.get("/subscriptions");
export const getUpcomingRenewals = (days = 30) =>
  api.get(`/subscriptions/upcoming-renewals?days=${days}`);
export const getSubscription = (id) => api.get(`/subscriptions/${id}`);
export const createSubscription = (data) => api.post("/subscriptions", data);
export const updateSubscription = (id, data) => api.put(`/subscriptions/${id}`, data);
export const deleteSubscription = (id) => api.delete(`/subscriptions/${id}`);
export const cancelSubscription = (id) => api.put(`/subscriptions/${id}/cancel`);
