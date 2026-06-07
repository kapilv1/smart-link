import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function SignIn({ setUser }) {
    const navigate = useNavigate();
    const [status, setStatus] = useState("");

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const data = await loginUser(form);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
            navigate("/home");
        } catch (err) {
            setStatus(err.message);
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Sign In</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <button type="submit">Sign In</button>

                <p>
                    Need account? <Link to="/signup">Sign Up</Link>
                </p>

                <p className="status">{status}</p>
            </form>
        </div>
    );
}

export default SignIn;