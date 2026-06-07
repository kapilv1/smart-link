import { API_URL, getAuthHeaders } from "../config/api";

export async function getUsers(user) {
    const res = await fetch(`${API_URL}/manager/users`, {
        headers: getAuthHeaders(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function getUserProfiles(user, userId) {
    const res = await fetch(`${API_URL}/manager/users/${userId}/profiles`, {
        headers: getAuthHeaders(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function blockUser(user, userId) {
    const res = await fetch(`${API_URL}/manager/users/${userId}/block`, {
        method: "PUT",
        headers: getAuthHeaders(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function unblockUser(user, userId) {
    const res = await fetch(`${API_URL}/manager/users/${userId}/unblock`, {
        method: "PUT",
        headers: getAuthHeaders(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function deleteProfile(user, profileId) {
    const res = await fetch(`${API_URL}/manager/profiles/${profileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}
export async function getSignupRequests(user) {
    const res = await fetch(`${API_URL}/manager/signup-requests`, {
        headers: getAuthHeaders(user),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function acceptSignupRequest(user, requestId) {
    const res = await fetch(
        `${API_URL}/manager/signup-requests/${requestId}/accept`,
        {
            method: "PUT",
            headers: getAuthHeaders(user),
        }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function dismissSignupRequest(user, requestId) {
    const res = await fetch(
        `${API_URL}/manager/signup-requests/${requestId}/dismiss`,
        {
            method: "PUT",
            headers: getAuthHeaders(user),
        }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}