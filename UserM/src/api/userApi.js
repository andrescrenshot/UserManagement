import {
  getAuthToken,
  clearAuth,
} from "../utils/auth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://usermanagement-production-f2c5.up.railway.app";

const getHeaders = () => {
  const token = getAuthToken();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const parseResponse = async (response) => {
  const text = await response.text();

  let body;

  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {
      message:
        text || "Response server tidak valid.",
    };
  }

  if (!response.ok) {
    const error = new Error(
      body?.message ||
        body?.error ||
        body?.detail ||
        `Request gagal (${response.status})`
    );

    error.status = response.status;
    error.response = body;

    if (response.status === 401) {
      clearAuth();
    }

    throw error;
  }

  return body;
};

const request = async (path, options = {}) => {
  const token = getAuthToken();

  if (!token) {
    const error = new Error(
      "Token login tidak ditemukan."
    );

    error.status = 401;

    throw error;
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {}),
      },
    }
  );

  return parseResponse(response);
};

export const getProfileApi = async () => {
  return request("/api/user", {
    method: "GET",
  });
};

export const getUsersApi = async () => {
  return request("/api/tambah-user", {
    method: "GET",
  });
};

export const getUserApi = async (id) => {
  if (!id) {
    throw new Error(
      "ID user tidak ditemukan."
    );
  }

  return request(
    `/api/edit-user/${id}`,
    {
      method: "GET",
    }
  );
};

export const createUserApi = async (
  data
) => {
  return request("/api/tambah-user", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateUserApi = async (
  id,
  data
) => {
  if (!id) {
    throw new Error(
      "ID user tidak ditemukan."
    );
  }

  return request(
    `/api/edit-user/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
};

export const deleteUserApi = async (
  id,
  reason = ""
) => {
  if (!id) {
    throw new Error(
      "ID user tidak ditemukan."
    );
  }

  return request(
    `/api/tambah-user/${id}`,
    {
      method: "DELETE",
      body: JSON.stringify({
        reason,
      }),
    }
  );
};

export { API_URL };