import { apiClient } from "./apiClient.js";

export const driversApi = {
  list: (params) => apiClient.get("/drivers", { params }),
  available: () => apiClient.get("/drivers/available"),
  create: (payload) => apiClient.post("/drivers", payload),
  update: (id, payload) => apiClient.put(`/drivers/${id}`, payload),
  remove: (id) => apiClient.delete(`/drivers/${id}`),
};
