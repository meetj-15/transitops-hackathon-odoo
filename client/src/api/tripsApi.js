import { apiClient } from "./apiClient.js";

export const tripsApi = {
  list: (params) => apiClient.get("/trips", { params }),
  create: (payload) => apiClient.post("/trips", payload),
  dispatch: (id) => apiClient.post(`/trips/${id}/dispatch`),
  complete: (id, payload) => apiClient.post(`/trips/${id}/complete`, payload),
  cancel: (id) => apiClient.post(`/trips/${id}/cancel`),
};
