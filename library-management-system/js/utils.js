const API_BASE = "https://karyar-library-management-system.liara.run/api";
const TOKEN_KEY = "auth_token";

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function authFetch(path, options = {}) {
  const token = getToken();
  const headers = options.headers ? { ...options.headers } : {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && !(headers["Content-Type"] || headers["content-type"])) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    removeToken();

    if (!window.location.href.includes("login.html")) {
      window.location.href = "login.html";
    }

    throw new Error("Unauthorized. Redirecting to login.");
  }

  return res;
}
