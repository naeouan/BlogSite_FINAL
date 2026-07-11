import Post from "../Post";
import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

const previousChampions = [
  {
    year: 2021,
    team: "Team Spirit",
    players: ["Yatoro", "TORONTOTOKYO", "Collapse", "Mira", "Miposhka"],
  },
  {
    year: 2022,
    team: "Tundra Esports",
    players: ["Skiter", "Nine", "33", "Sneyking", "Saksa"],
  },
  {
    year: 2023,
    team: "Team Spirit",
    players: ["Yatoro", "TORONTOTOKYO", "Collapse", "Mira", "Miposhka"],
  },
];

const metaHeroes = [
  {
    hero: "Invoker",
    winrate: "57%",
    items: ["Aghanim's Scepter", "Octarine Core", "Black King Bar"],
    description:
      "A versatile hero that excels in controlling fights with a vast array of spells.",
  },
  {
    hero: "Pudge",
    winrate: "56%",
    items: ["Blink Dagger", "Aghanim's Scepter", "Guardian Greaves"],
    description:
      "Dominates through his tanky nature and the ability to hook enemies into dangerous positions.",
  },
  {
    hero: "Storm Spirit",
    winrate: "58%",
    items: ["Bloodstone", "Orchid Malevolence", "Kaya and Sange"],
    description:
      "Known for mobility and burst damage potential, making him a dominant pick in team fights.",
  },
];

export default function IndexPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/post`)
      .then((response) => response.json())
      .then(setPosts);
  }, []);

  return (
    <div className="index-container">
      {/* Hero */}
      <div className="index-hero">
        <span className="index-hero-eyebrow">✦ Dota 2 &amp; Beyond</span>
        <h1 className="index-title">
          Stories Worth <span>Reading</span>
        </h1>
        <p className="index-subtitle">
          Community articles, Dota 2 meta breakdowns, and more — straight from
          the trenches.
        </p>
      </div>

      {/* Posts */}
      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <div
              key={post._id}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <Post {...post} />
            </div>
          ))
        ) : (
          <div className="posts-empty">
            <div className="posts-empty-icon">📝</div>
            <p>No posts yet. Be the first to write something!</p>
          </div>
        )}
      </div>

      {/* Dota Section */}
      <div className="dota-section-header">
        <h2>Dota 2 Corner</h2>
        <p>The International champions &amp; current meta picks</p>
      </div>

      <div className="dota-section">
        {/* TI Champions */}
        <div className="dota-panel">
          <h2 className="section-title">TI Champions</h2>
          <ul>
            {previousChampions.map((champion) => (
              <li key={champion.year} className="champion-item">
                <h3>
                  <span className="champion-year-badge">{champion.year}</span>
                  {champion.team}
                </h3>
                <p>
                  <strong>Roster:</strong> {champion.players.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Meta Heroes */}
        <div className="dota-panel">
          <h2 className="section-title">Meta Heroes</h2>
          <ul>
            {metaHeroes.map((hero) => (
              <li key={hero.hero} className="hero-item">
                <div className="hero-header">
                  <h3>{hero.hero}</h3>
                  <span className="hero-winrate">{hero.winrate} WR</span>
                </div>
                <div className="hero-items-list">
                  {hero.items.map((item) => (
                    <span key={item} className="hero-item-chip">
                      {item}
                    </span>
                  ))}
                </div>
                <p>{hero.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Spotify */}
      <div className="spotify-card">
        <h2 className="spotify-title">Dota 2 Playlist</h2>
        <div className="spotify-embed">
          <iframe
            src="https://open.spotify.com/embed/album/6fpvsv041NQCRMpxAvwgLI?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Dota 2 Spotify Playlist"
          />
        </div>
      </div>
    </div>
  );
}
