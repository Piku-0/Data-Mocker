// src/lib/apiClient.ts or wherever you define it
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api", // <-- add /api here
  withCredentials: true,
});

export default apiClient;
