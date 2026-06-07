import { useEffect, useState } from "react";

import {
    getSignupRequests,
    acceptSignupRequest,
    dismissSignupRequest,
} from "../services/managerService";

function SignupAlert({ user }) {
    const [requests, setRequests] = useState([]);
    const [status, setStatus] = useState("");

    async function loadRequests() {
        try {
            const data = await getSignupRequests(user);
            setRequests(data);
        } catch {
            setRequests([]);
        }
    }

    useEffect(() => {
        if (user?.role !== "manager") return;

        loadRequests();

        const timer = setInterval(loadRequests, 3000);

        return () => clearInterval(timer);
    }, [user]);

    async function acceptRequest(id) {
        try {
            const data = await acceptSignupRequest(user, id);
            setStatus(data.message);
            await loadRequests();
        } catch (err) {
            setStatus(err.message);
        }
    }

    async function dismissRequest(id) {
        try {
            const data = await dismissSignupRequest(user, id);
            setStatus(data.message);
            await loadRequests();
        } catch (err) {
            setStatus(err.message);
        }
    }

    if (user?.role !== "manager" || requests.length === 0) return null;

    return (
        <div className="signup-alert">
            <h3>Someone is trying to sign up</h3>

            {requests.map((request) => (
                <div key={request._id} className="signup-request-card">
                    <p>
                        <strong>{request.username}</strong>
                    </p>
                    <p>{request.email}</p>

                    <button onClick={() => acceptRequest(request._id)}>Accept</button>
                    <button onClick={() => dismissRequest(request._id)}>Dismiss</button>
                </div>
            ))}

            <p className="status">{status}</p>
        </div>
    );
}

export default SignupAlert;