import {
    FaHome,
    FaUsers,
    FaKey,
    FaSignOutAlt
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import SignupAlert from "./SignupAlert";

function Navbar({ user, setUser }) {
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/signin");
    }

    return (
        <>
            <div className="navbar">
                <Link to="/home">
                    <FaHome /> Home
                </Link>

                <Link to="/changepassword">
                    <FaKey /> Change Password
                </Link>

                {user?.role === "manager" && (
                    <Link to="/manageaccount">
                        <FaUsers /> Manage Account
                    </Link>
                )}

                <button onClick={logout}>
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            <SignupAlert user={user} />
        </>
    );
}

export default Navbar;