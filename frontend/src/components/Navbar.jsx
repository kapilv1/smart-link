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
        <Link to="/home">Home</Link>
        <Link to="/changepassword">Change Password</Link>

        {user?.role === "manager" && (
          <Link to="/manageaccount">Manage Account</Link>
        )}

        <button onClick={logout}>Logout</button>
      </div>

      <SignupAlert user={user} />
    </>
  );
}

export default Navbar;