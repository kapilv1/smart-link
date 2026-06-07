import { useState } from "react";
import Navbar from "../components/Navbar";
import { changeUserPassword } from "../services/authService";

function ChangePasswordPage({ user, setUser }) {
    const [status, setStatus] = useState("");

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const data = await changeUserPassword(user, form);

            setForm({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });

            setStatus(data.message);
        } catch (err) {
            setStatus(err.message);
        }
    }

    return (
        <div className="app">
            <Navbar user={user} setUser={setUser} />

            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Change Password</h1>

                <input
                    type="password"
                    placeholder="Current password"
                    value={form.currentPassword}
                    onChange={(e) =>
                        setForm({ ...form, currentPassword: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="New password"
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={form.confirmNewPassword}
                    onChange={(e) =>
                        setForm({ ...form, confirmNewPassword: e.target.value })
                    }
                />

                <button type="submit">Update Password</button>

                <p className="status">{status}</p>
            </form>
        </div>
    );
}

export default ChangePasswordPage;