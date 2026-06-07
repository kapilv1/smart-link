function TopUser({ user, logout, setShowChangePassword, showChangePassword }) {
  return (
    <div className="top-user">
      <div className="avatar">{user.username.slice(0, 2).toUpperCase()}</div>

      <button onClick={() => setShowChangePassword(!showChangePassword)}>
        Change Password
      </button>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default TopUser;