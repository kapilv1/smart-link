export const API_URL = "https://smart-link-henna.vercel.app/api";
// export const API_URL = "http://localhost:5000/api";
export function getAuthHeaders(user) {
  return {
    "Content-Type": "application/json",
    "x-user-id": user?.id,
  };
}