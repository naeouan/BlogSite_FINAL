import { useState, useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import { API_URL } from "../config.js";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState("");
  const { setUserInfo } = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();
    setError("");
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (response.ok) {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
        setRedirect(true);
      });
    } else {
      setError("Invalid username or password. Please try again.");
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <span className="form-eyebrow">Welcome back</span>
          <h1>Sign in</h1>
          <p className="form-sub">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>

        <form onSubmit={login}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: "var(--accent-red)", fontSize: "0.85rem", marginTop: "8px" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary">
            Sign in →
          </button>
        </form>
      </div>
    </div>
  );
}
