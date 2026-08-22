export const saveAuth = (token, user, rememberMe = false) => {
  clearAuth();

  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem("token", token);
  storage.setItem("current_user", JSON.stringify(user));
  storage.setItem("isLoggedIn", "true");
  storage.setItem(
    "rememberMe",
    rememberMe ? "true" : "false"
  );

  if (rememberMe) {
    const expiresAt =
      Date.now() + 30 * 24 * 60 * 60 * 1000;

    localStorage.setItem(
      "expiresAt",
      String(expiresAt)
    );
  }
};

export const getAuthToken = () => {
  const localToken = localStorage.getItem("token");

  if (localToken) {
    const expiresAt =
      localStorage.getItem("expiresAt");

    if (
      expiresAt &&
      Date.now() >= Number(expiresAt)
    ) {
      clearAuth();
      return null;
    }

    return localToken;
  }

  return sessionStorage.getItem("token");
};

export const getCurrentUser = () => {
  const localUser =
    localStorage.getItem("current_user");

  if (localUser) {
    try {
      return JSON.parse(localUser);
    } catch {
      clearAuth();
      return null;
    }
  }

  const sessionUser =
    sessionStorage.getItem("current_user");

  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch {
      sessionStorage.removeItem("current_user");
      return null;
    }
  }

  return null;
};

export const updateCurrentUser = (user) => {
  if (!user) return;

  const rememberMe =
    localStorage.getItem("rememberMe") === "true";

  const storage = rememberMe
    ? localStorage
    : sessionStorage;

  storage.setItem(
    "current_user",
    JSON.stringify(user)
  );
};

export const isLoggedIn = () => {
  return !!getAuthToken();
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("current_user");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("expiresAt");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("current_user");
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("rememberMe");
};

export const getAuthHeaders = () => {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};