import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/auth/api",
  withCredentials: true,
});

// Automatically attempt token refresh on 401 responses
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh") &&
      !originalRequest.url.includes("/login")
    ) {
      originalRequest._retry = true;
      try {
        await api.post("/refresh");
        return api(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

