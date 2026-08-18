const API_URL = "http://127.0.0.1:9983";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (response) => {
  const text = await response.text();

  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  if (!response.ok) {
    throw new Error(
      body?.message ||
        body?.error ||
        `Request gagal (${response.status})`,
    );
  }

  return body;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  return parseResponse(response);
};

export const getUsersApi = () => request("/api/tambah-user");

export const getUserApi = (id) => request(`/api/edit-user/${id}`);

export const createUserApi = (data) =>
  request("/api/tambah-user", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUserApi = (id, data) =>
  request(`/api/edit-user/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUserApi = (id, reason) =>
  request(`/api/tambah-user/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ reason }),
  });
