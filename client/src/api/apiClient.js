import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "transitops_token";
const DEMO_TOKEN = "transitops-demo-token";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getStoredToken() {
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.sessionStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getStoredToken() !== DEMO_TOKEN) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent("transitops:unauthorized"));
    }

    return Promise.reject(error);
  }
);
