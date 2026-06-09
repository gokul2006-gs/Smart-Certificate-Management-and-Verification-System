import axios from "axios";

function resolveApiBaseUrl() {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
  }

  const apiPort = import.meta.env.VITE_API_PORT || "8000";
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${apiPort}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});


api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

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
