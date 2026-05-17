import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/",
  timeout: 15000,
});

client.interceptors.request.use(
  (config) => {

    const accessToken = localStorage.getItem("access");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.dispatchEvent(new Event("devsphere:logout"));
    }

    return Promise.reject(error);
  }
);

export default client;
