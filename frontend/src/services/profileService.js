import { API_URL, getAuthHeaders } from "../config/api";

export async function getProfiles(user) {
  const res = await fetch(`${API_URL}/profiles`, {
    headers: getAuthHeaders(user),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function createProfile(user, name) {
  const res = await fetch(`${API_URL}/profiles`, {
    method: "POST",
    headers: getAuthHeaders(user),
    body: JSON.stringify({ name }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}