import axios from "axios";

function resolveApiBaseUrl() {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  }

  const apiPort = import.meta.env.VITE_API_PORT || "8000";
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${apiPort}/api`;
}

export const UPLOAD_TIMEOUT_MS = 120000;

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  timeout: UPLOAD_TIMEOUT_MS,
});


api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export function formatApiError(error, fallback = "Request failed") {
  const data = error?.response?.data;
  if (!data) {
    return error?.message || fallback;
  }
  if (typeof data.error === "string") {
    return data.error;
  }
  if (typeof data.detail === "string") {
    return data.detail;
  }
  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Try again with fewer students or a smaller template image.";
  }
  if (!error?.response) {
    return "Network error. The server may have timed out while generating certificates.";
  }
  return fallback;
}

export const checkSession = async () => {
  const response = await api.get("/accounts/session/");
  return response.data;
};

export const getCsrfToken = async () => {
  const response = await api.get("/accounts/csrf/");
  api.defaults.headers.common["X-CSRFToken"] = response.data.csrfToken;
  return response.data.csrfToken;
};

export default api;
