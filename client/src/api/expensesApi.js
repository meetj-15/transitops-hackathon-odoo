import { apiClient } from "./apiClient.js";

export const expensesApi = {
  list: (params) => apiClient.get("/expenses", { params }),
  create: (payload) => apiClient.post("/expenses", payload),
};
