import Post from "../Post";
import { useEffect, useState } from "react";
import { API_URL } from '../config.js';

export default function IndexPage() {
  const [posts, setPosts] = useState([]);

useEffect(() => {
  fetch(`${API_URL}/post`)
    .then(response => response.json())
    .then(setPosts);
}, []);

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
      description: "Invoker is a versatile hero that excels in controlling fights with a vast array of spells.",
    },
    {
      hero: "Pudge",
      winrate: "56%",
      items: ["Blink Dagger", "Aghanim's Scepter", "Guardian Greaves"],
      description: "Pudge dominates through his tanky nature and the ability to hook enemies into dangerous positions.",
    },
    {
      hero: "Storm Spirit",
      winrate: "58%",
      items: ["Bloodstone", "Orchid Malevolence", "Kaya and Sange"],
      description: "Storm Spirit is known for his mobility and burst damage potential, making him a dominant pick in team fights.",
    },
  ];

  return (
    <div className="index-container">
      <h1 className="index-title">Latest Posts</h1>
      <p className="index-subtitle">Check out the latest articles from the community.</p>

      <div className="posts-list">
        {posts.length > 0 && posts.map(post => (
          <Post key={post._id} {...post} />
        ))}
      </div>

      <div className="dota-section">
        <div className="ti-champions">
          <h2 className="section-title">TI Champions & Players</h2>
          <ul>
            {previousChampions.map(champion => (
              <li key={champion.year} className="champion-item">
                <h3>{champion.year} - {champion.team}</h3>
                <p><strong>Players:</strong> {champion.players.join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="meta-heroes">
          <h2 className="section-title">Meta Heroes with High Winrates</h2>
          <ul>
            {metaHeroes.map(hero => (
              <li key={hero.hero} className="hero-item">
                <h3>{hero.hero} - {hero.winrate}</h3>
                <p><strong>Core Items:</strong> {hero.items.join(", ")}</p>
                <p>{hero.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="spotify-title">Dota 2 Playlist</h2>
      <div className="spotify-embed">
        <iframe
          src="https://open.spotify.com/embed/album/6fpvsv041NQCRMpxAvwgLI?utm_source=generator&theme=0"
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
