import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { API_URL } from "./config.js";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/profile`, {
      credentials: "include",
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });

    const dotaQuotes = [
      "Time to feed... or be fed!",
      "The enemy's middle tower has fallen — EZ Clap!",
      "You can't spell Victory without Meepo... somehow.",
      "Pudge is love. Pudge is life.",
      "Invoker has spoken... too much, as usual.",
      "Shadow Fiend’s wardrobe called — it’s on fire!",
      "Remember: Roshan always wins.",
      "This lane is mine. So is the jungle. And the shop.",
      "Why walk when you can TP... and feed faster?",
      "Warding is caring. Or baiting. Usually baiting.",
    ];

    const randomQuote = dotaQuotes[Math.floor(Math.random() * dotaQuotes.length)];
    setQuote(randomQuote);
  }, [setUserInfo]);

  function logout() {
    fetch(`${API_URL}/logout`, {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        gap: "20px",
      }}
    >
      <Link
        to="/"
        className="logo"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "bold",
          fontSize: "1.5rem",
          flexShrink: 0,
        }}
      >
        <img
          src="dota2.png"
          alt="Dota 2 Logo"
          style={{ width: "30px", height: "30px" }}
        />
        My Blog
      </Link>

      <div
        style={{
          flexGrow: 1,
          textAlign: "center",
          fontStyle: "italic",
          color: "#888",
          fontSize: "1rem",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={quote}
      >
        "{quote}"
      </div>

      <nav
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {username ? (
          <>
            <Link to="/create">Create new post</Link>
            <a onClick={logout} style={{ cursor: "pointer" }}>
              Logout ({username})
            </a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
