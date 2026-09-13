import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("rf_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const setToken = (t) => {
  if (t) localStorage.setItem("rf_token", t);
  else localStorage.removeItem("rf_token");
};

export const fileUrl = (path) => {
  const token = localStorage.getItem("rf_token");
  return `${API}/files/${path}`;
};

export const fetchBlobUrl = async (path) => {
  if (!path) return null;
  const res = await api.get(`/files/${path}`, { responseType: "blob" });
  return URL.createObjectURL(res.data);
};
