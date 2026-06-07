import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestSignup, getSignupStatus } from "../services/authService";

function SignUp() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [requestId, setRequestId] = useState(null);
  const [waiting, setWaiting] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!requestId || !waiting) return;

    const timer = setInterval(async () => {
      try {
        const data = await getSignupStatus(requestId);

        setStatus(data.message);

        if (data.status === "approved") {
          clearInterval(timer);
          setWaiting(false);

          setTimeout(() => {
            navigate("/signin");
          }, 1500);
        }

        if (data.status === "dismissed" || data.status === "expired") {
          clearInterval(timer);
          setWaiting(false);
        }
      } catch (err) {
        setStatus(err.message);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [requestId, waiting, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await requestSignup(form);

      setRequestId(data.requestId);
      setWaiting(true);
      setStatus("Waiting for manager response...");
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Sign Up</h1>

        {!waiting && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />

            <button type="submit">Request Signup</button>
          </>
        )}

        {waiting && (
          <div className="waiting-box">
            <h3>Waiting for manager response...</h3>
            <p>Please keep this page open.</p>
          </div>
        )}

        <p>
          Already have account? <Link to="/signin">Sign In</Link>
        </p>

        <p className="status">{status}</p>
      </form>
    </div>
  );
}

export default SignUp;