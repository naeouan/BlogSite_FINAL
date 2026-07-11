import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { API_URL } from "../config.js";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const { setUserInfo } = useContext(UserContext);
  const navigate = useNavigate();

  async function register(ev) {
    ev.preventDefault();
    setMessage({ text: "", type: "" });
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.status === 201) {
      const userInfo = await response.json();
      setUserInfo(userInfo);
      setMessage({ text: "Account created! Logging in...", type: "success" });
      setTimeout(() => navigate("/"), 1500);
    } else {
      const error = await response.json();
      setMessage({
        text: "Registration failed: " + (error.message || "Unknown error"),
        type: "error",
      });
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <div className="form-header">
          <span className="form-eyebrow">Join us</span>
          <h1>Create account</h1>
          <p className="form-sub">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>

        <form onSubmit={register}>
          <div className="input-group">
            <label className="input-label" htmlFor="reg-username">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(ev) => setUsername(ev.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
            />
          </div>

          {message.text && (
            <p
              style={{
                color: message.type === "success" ? "var(--accent-green)" : "var(--accent-red)",
                fontSize: "0.85rem",
                marginTop: "8px",
              }}
            >
              {message.text}
            </p>
          )}

          <button type="submit" className="btn-primary">
            Create account →
          </button>
        </form>
      </div>
    </div>
  );
}
