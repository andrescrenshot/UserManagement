// src/utils/auth.js

const REMEMBER_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Hari

export const removeAuthSession = () => {
  const keys = ["token", "current_user", "isLoggedIn", "rememberMe", "expiresAt"];
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const saveAuth = (token, user, rememberMe = false) => {
  // Bersihkan sesi lama agar tidak terjadi konflik antar storage
  removeAuthSession();

  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem("token", token);
  storage.setItem("current_user", JSON.stringify(user || {}));
  storage.setItem("isLoggedIn", "true");
  storage.setItem("rememberMe", rememberMe ? "true" : "false");

  if (rememberMe) {
    const expiresAt = Date.now() + REMEMBER_DURATION_MS;
    storage.setItem("expiresAt", String(expiresAt));
  }
};

export const getAuthToken = () => {
  // 1. Prioritaskan pengecekan localStorage (Remember Me)
  const localToken = localStorage.getItem("token");

  if (localToken) {
    const expiresAt = Number(localStorage.getItem("expiresAt") || 0);

    // Jika waktu 30 hari sudah habis di frontend, bersihkan sesi
    if (expiresAt && Date.now() >= expiresAt) {
      clearAuth();
      return null;
    }
    return localToken;
  }

  // 2. Jika tidak ada di localStorage, ambil dari sessionStorage
  return sessionStorage.getItem("token");
};

export const getCurrentUser = () => {
  const localUser = localStorage.getItem("current_user");
  const sessionUser = sessionStorage.getItem("current_user");

  const rawUser = localUser || sessionUser;

  if (rawUser) {
    try {
      return JSON.parse(rawUser);
    } catch {
      localStorage.removeItem("current_user");
      sessionStorage.removeItem("current_user");
    }
  }

  return null;
};

export const updateCurrentUser = (user) => {
  if (!user) return;

  const isRemember = localStorage.getItem("rememberMe") === "true";
  const storage = isRemember ? localStorage : sessionStorage;

  storage.setItem("current_user", JSON.stringify(user));
};

export const isLoggedIn = () => {
  return !!getAuthToken();
};

export const logoutAuth = () => {
  removeAuthSession();
};

export const clearAuth = () => {
  removeAuthSession();
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};