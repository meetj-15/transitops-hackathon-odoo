import { apiClient } from "./apiClient.js";

export const maintenanceApi = {
  list: (params) => apiClient.get("/maintenance", { params }),
  create: (payload) => apiClient.post("/maintenance", payload),
  close: (id, payload) => apiClient.put(`/maintenance/${id}/close`, payload),
};
