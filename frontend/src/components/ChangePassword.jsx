import { useState } from "react";
import { changeUserPassword } from "../services/authService";

function ChangePassword({ user, setStatus, setShowChangePassword }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  async function changePassword(e) {
    e.preventDefault();

    try {
      const data = await changeUserPassword(user, passwordForm);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setShowChangePassword(false);
      setStatus(data.message);
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <form className="change-password-box" onSubmit={changePassword}>
      <input
        type="password"
        placeholder="Current password"
        value={passwordForm.currentPassword}
        onChange={(e) =>
          setPasswordForm({
            ...passwordForm,
            currentPassword: e.target.value,
          })
        }
      />

      <input
        type="password"
        placeholder="New password"
        value={passwordForm.newPassword}
        onChange={(e) =>
          setPasswordForm({
            ...passwordForm,
            newPassword: e.target.value,
          })
        }
      />

      <input
        type="password"
        placeholder="Confirm new password"
        value={passwordForm.confirmNewPassword}
        onChange={(e) =>
          setPasswordForm({
            ...passwordForm,
            confirmNewPassword: e.target.value,
          })
        }
      />

      <button type="submit">Update Password</button>
    </form>
  );
}

export default ChangePassword;