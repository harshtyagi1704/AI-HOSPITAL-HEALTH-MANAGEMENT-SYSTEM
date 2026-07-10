import axios from "axios";

const api = axios.create({
    baseURL: "https://hospital-backend-9e41.onrender.com/api"
});

export default api;
