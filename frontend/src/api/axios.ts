import axios from "axios";

/*
|--------------------------------------------------------------------------
| BASE URL DE LA API
|--------------------------------------------------------------------------
| VITE_API_URL la define el entorno de build (Vite la inyecta en tiempo de
| compilación). En Docker vale "/api": el proxy de nginx reenvía /api/* al
| backend, de modo que todo va por el mismo origen y no hay problemas de CORS.
| En desarrollo local (npm run dev) cae al backend de artisan serve.
*/

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/*
|--------------------------------------------------------------------------
| INTERCEPTOR TOKEN
|--------------------------------------------------------------------------
*/

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;