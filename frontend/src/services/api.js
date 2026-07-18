import axios from "axios";

const api = axios.create({
  baseURL: "https://hospital-backend-9e41.onrender.com/api",
});

// ================= REQUEST INTERCEPTOR =================
// Automatically attach JWT token

api.interceptors.request.use((config) => {

  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

// ================= RESPONSE INTERCEPTOR =================
// Automatically logout if token is invalid or expired

api.interceptors.response.use(

  (response) => response,

  (error) => {
         if (
    error.response?.status === 401 &&
    sessionStorage.getItem("token")
) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
}

    return Promise.reject(error);

  }

);

export default api;