import Post from "../Post";
import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [metaHeroes, setMetaHeroes] = useState([]);
  const [proMatches, setProMatches] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Fetch blog posts
    fetch(`${API_URL}/post`)
      .then((response) => response.json())
      .then(setPosts)
      .catch((err) => console.error("Error fetching posts:", err));

    // Fetch OpenDota Live Meta & Pro Matches
    const opendotaEndpoints = [
      "https://api.opendota.com/api/heroStats",
      "https://api.opendota.com/api/proMatches"
    ];

    Promise.all(
      opendotaEndpoints.map((url) =>
        fetch(url).then((res) => {
          if (!res.ok) throw new Error("HTTP error");
          return res.json();
        })
      )
    )
      .then(([heroData, matchesData]) => {
        if (Array.isArray(heroData) && Array.isArray(matchesData)) {
          // Compute live meta: filter for heroes with enough picks, then sort by winrate
          const sortedMeta = heroData
            .filter((h) => h.pro_pick > 10)
            .map((h) => ({
              ...h,
              winrate: ((h.pro_win / h.pro_pick) * 100).toFixed(1)
            }))
            .sort((a, b) => b.winrate - a.winrate)
            .slice(0, 5);
          setMetaHeroes(sortedMeta);

          // Take the 5 most recent pro matches
          setProMatches(matchesData.slice(0, 5));
        } else {
          throw new Error("Invalid API response format");
        }
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error("Error loading OpenDota data:", err);
        setLoadingStats(false);
      });
  }, []);

  const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="index-container fade-up">
      {/* Hero */}
      <div className="index-hero">
        <span className="index-hero-eyebrow"><span>✦</span> Dota 2 &amp; Beyond</span>
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
        <h2>Live Dota 2 Corner</h2>
        <p>Real-time statistics and recent pro matches from OpenDota API</p>
      </div>

      {loadingStats ? (
        <div className="loader-container min-h-300">
          <div className="spinner"></div>
          <p>Connecting to OpenDota API...</p>
        </div>
      ) : (
        <div className="dota-section">
          {/* Live Pro Matches */}
          <div className="dota-panel">
            <h2 className="section-title">Recent Pro Matches</h2>
            <ul className="index-pro-matches-list">
              {proMatches.map((match) => (
                <li key={match.match_id} className="index-match-item">
                  <a
                    href={`https://www.opendota.com/matches/${match.match_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="match-item-link"
                  >
                    <div className="match-league-lbl">{match.league_name}</div>
                    <div className="match-teams-row">
                      <div className="match-team radiant-side">
                        <span className="match-team-name">{match.radiant_name || "Radiant"}</span>
                        <span className="match-team-score">{match.radiant_score ?? 0}</span>
                      </div>
                      <span className="match-vs-divider">VS</span>
                      <div className="match-team dire-side">
                        <span className="match-team-score">{match.dire_score ?? 0}</span>
                        <span className="match-team-name">{match.dire_name || "Dire"}</span>
                      </div>
                    </div>
                    <div className="match-footer-row">
                      <span
                        className={`match-winner-tag ${
                          match.radiant_win ? "win-radiant" : "win-dire"
                        }`}
                      >
                        {match.radiant_win ? "Radiant Won" : "Dire Won"}
                      </span>
                      <span className="match-duration-txt">
                        ⏱ {formatDuration(match.duration)}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Live Meta Heroes */}
          <div className="dota-panel">
            <h2 className="section-title">Live Meta Heroes</h2>
            <ul className="index-meta-heroes-list">
              {metaHeroes.map((hero) => (
                <li key={hero.id} className="index-hero-item">
                  <div className="index-hero-left">
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com${hero.img}`}
                      alt={hero.localized_name}
                      className="index-hero-img"
                    />
                    <div className="index-hero-name-col">
                      <h3>{hero.localized_name}</h3>
                      <span className="index-hero-roles">
                        {hero.roles.slice(0, 2).join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="index-hero-right">
                    <span className="hero-winrate">{hero.winrate}% WR</span>
                    <span className="hero-picks-lbl">{hero.pro_pick} pro picks</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

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
