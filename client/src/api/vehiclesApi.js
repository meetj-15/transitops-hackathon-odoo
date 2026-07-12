import { apiClient } from "./apiClient.js";

export const vehiclesApi = {
  list: (params) => apiClient.get("/vehicles", { params }),
  create: (payload) => apiClient.post("/vehicles", payload),
  update: (id, payload) => apiClient.put(`/vehicles/${id}`, payload),
  retire: (id) => apiClient.delete(`/vehicles/${id}`),
};
