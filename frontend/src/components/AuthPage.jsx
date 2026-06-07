import { useState } from "react";
import { loginUser, signupUser } from "../services/authService";

function AuthPage({ setUser, status, setStatus }) {
    const [isSignup, setIsSignup] = useState(false);

    const [authForm, setAuthForm] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });

    async function handleAuth(e) {
        e.preventDefault();

        try {
            const data = isSignup
                ? await signupUser(authForm)
                : await loginUser(authForm);

            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
            setStatus("");
        } catch (err) {
            setStatus(err.message);
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleAuth}>
                <h1>{isSignup ? "Create Account" : "Login"}</h1>

                <input
                    type="text"
                    placeholder="Username"
                    value={authForm.username}
                    onChange={(e) =>
                        setAuthForm({ ...authForm, username: e.target.value })
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={authForm.password}
                    onChange={(e) =>
                        setAuthForm({ ...authForm, password: e.target.value })
                    }
                />

                {isSignup && (
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={authForm.confirmPassword}
                        onChange={(e) =>
                            setAuthForm({ ...authForm, confirmPassword: e.target.value })
                        }
                    />
                )}

                <button type="submit">{isSignup ? "Sign Up" : "Login"}</button>

                <p onClick={() => setIsSignup(!isSignup)} className="auth-switch">
                    {isSignup ? "Already have account? Login" : "Need account? Sign Up"}
                </p>

                <p className="status">{status}</p>
            </form>
        </div>
    );
}

export default AuthPage;