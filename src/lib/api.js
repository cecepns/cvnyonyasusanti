import axios from "axios";

export const api = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://api.kingcreativestudio.my.id/cv-nyonyasusanti/api",
});

/** Pesan error dari respons API (axios) untuk toast / UI. */
export function apiErrorMessage(error, fallback = "Terjadi kesalahan") {
  return error?.response?.data?.message || error?.message || fallback;
}

