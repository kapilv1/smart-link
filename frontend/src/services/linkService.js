import { API_URL, getAuthHeaders } from "../config/api";

export async function getLinks(user, profileId) {
    const res = await fetch(`${API_URL}/profiles/${profileId}/links`, {
        headers: getAuthHeaders(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function saveProfileLinks(user, profileId, links) {
    const res = await fetch(`${API_URL}/profiles/${profileId}/links`, {
        method: "POST",
        headers: getAuthHeaders(user),
        body: JSON.stringify({ links }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}
export async function deleteSelectedLinks(user, profileId, linkIds) {
    const res = await fetch(`${API_URL}/profiles/${profileId}/links`, {
        method: "DELETE",
        headers: getAuthHeaders(user),
        body: JSON.stringify({ linkIds }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}
export async function deleteAllProfileLinks(user, profileId) {
    const res = await fetch(`${API_URL}/profiles/${profileId}/links/all`, {
        method: "DELETE",
        headers: getAuthHeaders(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}