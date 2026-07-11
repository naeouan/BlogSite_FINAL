import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { API_URL } from "./config.js";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const [quote, setQuote] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/profile`, {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });

    const dotaQuotes = [
      "Time to feed... or be fed!",
      "The enemy's middle tower has fallen — EZ Clap!",
      "You can't spell Victory without Meepo... somehow.",
      "Pudge is love. Pudge is life.",
      "Invoker has spoken... too much, as usual.",
      "Shadow Fiend's wardrobe called — it's on fire!",
      "Remember: Roshan always wins.",
      "This lane is mine. So is the jungle. And the shop.",
      "Why walk when you can TP... and feed faster?",
      "Warding is caring. Or baiting. Usually baiting.",
    ];

    const randomQuote = dotaQuotes[Math.floor(Math.random() * dotaQuotes.length)];
    setQuote(randomQuote);

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src="dota2.png" alt="Dota 2 Logo" />
          Dota 2 Blog
        </Link>

        {/* Dota quote ticker */}
        <div className="header-quote" title={quote}>
          {quote}
        </div>

        {/* Nav */}
        <nav>
          {username ? (
            <>
              <Link to="/create" className="nav-create">
                + New Post
              </Link>
              <span className="nav-logout" onClick={logout}>
                Logout ({username})
              </span>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
