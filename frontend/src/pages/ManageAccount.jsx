import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

import {
    getUsers,
    getUserProfiles,
    blockUser,
    unblockUser,
    deleteProfile,
} from "../services/managerService";

function ManageAccount({ user, setUser }) {
    const [users, setUsers] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const data = await getUsers(user);
            setUsers(data);
        } catch (err) {
            setStatus(err.message);
        }
    }

    async function selectUser(targetUser) {
        setSelectedUser(targetUser);

        try {
            const data = await getUserProfiles(user, targetUser._id);
            setProfiles(data);
        } catch (err) {
            setStatus(err.message);
        }
    }

    async function handleBlock(targetUser) {
        try {
            const data =
                targetUser.status === "blocked"
                    ? await unblockUser(user, targetUser._id)
                    : await blockUser(user, targetUser._id);

            setStatus(data.message);
            await loadUsers();

            if (selectedUser?._id === targetUser._id) {
                setSelectedUser({
                    ...targetUser,
                    status: targetUser.status === "blocked" ? "active" : "blocked",
                });
            }
        } catch (err) {
            setStatus(err.message);
        }
    }

    async function handleDeleteProfile(profileId) {
        const ok = window.confirm("Delete this profile and all links?");
        if (!ok) return;

        try {
            const data = await deleteProfile(user, profileId);
            setStatus(data.message);

            if (selectedUser) {
                const updatedProfiles = await getUserProfiles(user, selectedUser._id);
                setProfiles(updatedProfiles);
            }
        } catch (err) {
            setStatus(err.message);
        }
    }

    return (
        <div className="app">
            <Navbar user={user} setUser={setUser} />

            <h1>Manage Account</h1>

            <div className="manage-layout">
                <div className="user-list">
                    <h2>Users</h2>

                    {users.map((item) => (
                        <div
                            key={item._id}
                            className={`user-card ${selectedUser?._id === item._id ? "active-user" : ""
                                }`}
                            onClick={() => selectUser(item)}
                        >
                            <strong>{item.username}</strong>
                            <p>{item.email}</p>
                            <p>{item.role}</p>
                            <p>{item.status}</p>
                        </div>
                    ))}
                </div>

                <div className="profile-tree">
                    <h2>Profiles</h2>

                    {!selectedUser && <p>Select user first.</p>}

                    {selectedUser && (
                        <>
                            <div className="selected-user-header">
                                <h3>{selectedUser.username}</h3>

                                {selectedUser.role !== "manager" && (
                                    <button onClick={() => handleBlock(selectedUser)}>
                                        {selectedUser.status === "blocked"
                                            ? "Unblock User"
                                            : "Block User"}
                                    </button>
                                )}
                            </div>

                            {profiles.length === 0 && <p>No profiles found.</p>}

                            {profiles.map((profile) => (
                                <div key={profile._id} className="profile-item">
                                    <span>📁 {profile.name}</span>

                                    <button onClick={() => handleDeleteProfile(profile._id)}>
                                        Delete Profile
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            <p className="status">{status}</p>
        </div>
    );
}

export default ManageAccount;