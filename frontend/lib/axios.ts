import axios from "axios";

export const API_BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoint yang TIDAK butuh token sama sekali — jangan pernah kirim
// Authorization header ke sini walau ada token (basi/rusak) tersimpan di localStorage.
const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register"];

api.interceptors.request.use((config) => {
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((path) => config.url?.includes(path));

  if (!isPublicEndpoint) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Kalau server balikin 401 (token invalid/expired) di request MANAPUN selain login/register,
// otomatis bersihkan token yang rusak itu, biar nggak nyangkut terus-terusan.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((path) => error.config?.url?.includes(path));
    if (!isPublicEndpoint && error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
}

export default api;