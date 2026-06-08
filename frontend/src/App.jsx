import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import History from "./pages/History";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ManageAccount from "./pages/ManageAccount";

import ProtectedRoute from "./components/ProtectedRoute";
import ManagerRoute from "./components/ManagerRoute";

import "./App.css";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/home" : "/signin"} />} />

        <Route path="/signin" element={<SignIn setUser={setUser} />} />

        <Route path="/signup" element={<SignUp setUser={setUser} />} />
        <Route
          path="/history/:profileId"
          element={
            <ProtectedRoute user={user}>
              <History user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <Home user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/changepassword"
          element={
            <ProtectedRoute user={user}>
              <ChangePasswordPage user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manageaccount"
          element={
            <ManagerRoute user={user}>
              <ManageAccount user={user} setUser={setUser} />
            </ManagerRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;