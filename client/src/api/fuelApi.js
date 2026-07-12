import { apiClient } from "./apiClient.js";

export const fuelApi = {
  list: (params) => apiClient.get("/fuel-logs", { params }),
  create: (payload) => apiClient.post("/fuel-logs", payload),
};
