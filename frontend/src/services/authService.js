import { API_URL, getAuthHeaders } from "../config/api";

export async function requestSignup(form) {
  const res = await fetch(`${API_URL}/auth/request-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function getSignupStatus(requestId) {
  const res = await fetch(`${API_URL}/auth/signup-status/${requestId}`);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function loginUser(form) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function changeUserPassword(user, form) {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "PUT",
    headers: getAuthHeaders(user),
    body: JSON.stringify(form),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}