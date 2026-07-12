import { apiClient } from "./apiClient.js";

export const dashboardApi = {
  stats: (params) => apiClient.get("/dashboard", { params }),
  kpis: (params) => apiClient.get("/dashboard", { params }),
};
