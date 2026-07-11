import { useState, useEffect } from "react";

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Hero map for lookup
  const [heroMap, setHeroMap] = useState({});
  
  // Player data states
  const [profile, setProfile] = useState(null);
  const [winLoss, setWinLoss] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [topHeroes, setTopHeroes] = useState([]);

  // Popular pro players list
  const popularPlayers = [
    { name: "Arteezy", id: "86745912" },
    { name: "Yatoro", id: "111620041" },
    { name: "Miracle-", id: "321580662" },
    { name: "Topson", id: "94054712" }
  ];

  // Fetch heroes on mount to build the map
  useEffect(() => {
    fetch("https://api.opendota.com/api/heroes")
      .then((res) => res.json())
      .then((data) => {
        const mapping = {};
        data.forEach((h) => {
          // Normalize name: npc_dota_hero_antimage -> antimage
          const normName = h.name.replace("npc_dota_hero_", "");
          mapping[h.id] = {
            id: h.id,
            name: h.localized_name,
            img: `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${normName}.png`
          };
        });
        setHeroMap(mapping);
      })
      .catch((err) => console.error("Error loading heroes mapping:", err));
  }, []);

  const handleSearch = (id) => {
    if (!id || isNaN(id)) {
      setError("Please enter a valid numeric Steam Account ID.");
      return;
    }
    
    setLoading(true);
    setError(null);

    const endpoints = [
      `https://api.opendota.com/api/players/${id}`,
      `https://api.opendota.com/api/players/${id}/wl`,
      `https://api.opendota.com/api/players/${id}/recentMatches`,
      `https://api.opendota.com/api/players/${id}/heroes`
    ];

    Promise.all(endpoints.map((url) => fetch(url).then((res) => res.json())))
      .then(([profData, wlData, matchesData, topHeroesData]) => {
        if (!profData || !profData.profile) {
          setError("Player profile not found. Make sure the Account ID is correct and public.");
          setProfile(null);
          setWinLoss(null);
          setRecentMatches([]);
          setTopHeroes([]);
        } else {
          setProfile(profData);
          setWinLoss(wlData);
          setRecentMatches(matchesData || []);
          setTopHeroes(topHeroesData || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching player stats:", err);
        setError("An error occurred while fetching player statistics.");
        setLoading(false);
      });
  };

  const getRankName = (rankTier) => {
    if (!rankTier) return "Unranked";
    const brackets = ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"];
    const bracketIndex = Math.floor(rankTier / 10) - 1;
    const stars = rankTier % 10;
    const bracket = brackets[Math.min(Math.max(bracketIndex, 0), 7)];
    if (bracket === "Immortal") return "Immortal";
    return `${bracket} [${stars}]`;
  };

  const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const timeAgo = (timestamp) => {
    const diffMs = Date.now() - timestamp * 1000;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 0) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="players-page fade-up">
      {/* Player Header */}
      <div className="index-hero">
        <span className="index-hero-eyebrow"><span>✦</span> Player Profile</span>
        <h1 className="index-title">
          Stats <span>Lookup</span>
        </h1>
        <p className="index-subtitle">
          Search for player statistics, MMR estimates, recent matches, and hero win rates.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="lookup-wrapper">
        <form
          className="search-box lookup-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
        >
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Enter Steam Account ID (e.g. 86745912)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="lookup-submit-btn">
            Lookup
          </button>
        </form>

        <div className="suggestion-chips">
          <span className="suggestion-title">Suggestions:</span>
          {popularPlayers.map((player) => (
            <button
              key={player.id}
              className="suggestion-chip"
              onClick={() => {
                setSearchQuery(player.id);
                handleSearch(player.id);
              }}
            >
              {player.name}
            </button>
          ))}
        </div>

        {error && <div className="lookup-error">{error}</div>}
      </div>

      {/* Loading Dashboard */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Fetching Player Details...</p>
        </div>
      ) : (
        profile && (
          <div className="player-dashboard">
            {/* Upper Dashboard: Profile & Lifetime W/L */}
            <div className="player-meta-section">
              {/* Profile Card */}
              <div className="player-profile-card">
                <img
                  src={profile.profile.avatarfull}
                  alt={profile.profile.personaname}
                  className="player-avatar-large"
                />
                <div className="player-profile-info">
                  <div className="player-username-row">
                    <h2>{profile.profile.personaname}</h2>
                    {profile.profile.loccountrycode && (
                      <span className="country-badge" title={`Country: ${profile.profile.loccountrycode}`}>
                        {profile.profile.loccountrycode}
                      </span>
                    )}
                  </div>
                  <div className="player-stats-row">
                    <div className="player-stat-box">
                      <span className="player-stat-lbl">Rank</span>
                      <span className="player-stat-val text-gold">
                        {getRankName(profile.rank_tier)}
                      </span>
                    </div>
                    <div className="player-stat-box">
                      <span className="player-stat-lbl">Estimated MMR</span>
                      <span className="player-stat-val">
                        {profile.mmr_estimate?.estimate
                          ? Number(profile.mmr_estimate.estimate).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <a
                    href={profile.profile.profileurl}
                    target="_blank"
                    rel="noreferrer"
                    className="steam-profile-link"
                  >
                    View Steam Profile ↗
                  </a>
                </div>
              </div>

              {/* Lifetime Win Loss */}
              {winLoss && (
                <div className="player-wl-card">
                  <div className="section-title">Lifetime W/L</div>
                  <div className="wl-numbers-row">
                    <div className="wl-box text-health">
                      <span className="wl-count">{winLoss.win}</span>
                      <span className="wl-label">Wins</span>
                    </div>
                    <div className="wl-box text-accent-red">
                      <span className="wl-count">{winLoss.lose}</span>
                      <span className="wl-label">Losses</span>
                    </div>
                  </div>
                  <div className="wl-percentage-container">
                    <div className="wl-bar-outer">
                      <div
                        className="wl-bar-inner"
                        style={{
                          width: `${
                            (winLoss.win / (winLoss.win + winLoss.lose)) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="wl-ratio-label">
                      Win Rate:{" "}
                      <strong>
                        {(
                          (winLoss.win / (winLoss.win + winLoss.lose)) *
                          100
                        ).toFixed(1)}
                        %
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Dashboard: Recent Matches & Top Heroes */}
            <div className="player-matches-grid">
              {/* Recent Matches */}
              <div className="player-recent-matches-panel">
                <div className="section-title">Recent Matches (Last 10)</div>
                <div className="recent-matches-list">
                  {recentMatches.slice(0, 10).map((match, index) => {
                    const hero = heroMap[match.hero_id] || {
                      name: `Hero #${match.hero_id}`,
                      img: "logo.svg",
                    };
                    const isRadiant = match.player_slot < 128;
                    const didWin = match.radiant_win === isRadiant;

                    return (
                      <div key={match.match_id || index} className="recent-match-row">
                        <div className="match-hero-info">
                          <img
                            src={hero.img}
                            alt={hero.name}
                            className="match-hero-thumb"
                            onError={(e) => {
                              e.target.src = "logo.svg";
                            }}
                          />
                          <div className="match-hero-meta">
                            <h4>{hero.name}</h4>
                            <span className="match-id-lbl">ID: {match.match_id}</span>
                          </div>
                        </div>

                        <div className="match-result-col">
                          <span
                            className={`match-result-badge ${
                              didWin ? "win" : "loss"
                            }`}
                          >
                            {didWin ? "WIN" : "LOSS"}
                          </span>
                          <span className="match-time-lbl">
                            {timeAgo(match.start_time)}
                          </span>
                        </div>

                        <div className="match-kda-col">
                          <div className="kda-values">
                            <strong>{match.kills}</strong> /{" "}
                            <span className="text-accent-red">{match.deaths}</span> /{" "}
                            <strong>{match.assists}</strong>
                          </div>
                          <span className="kda-label">K / D / A</span>
                        </div>

                        <div className="match-economy-col">
                          <div className="econ-values">
                            <span className="gpm-val">{match.gold_per_min} G</span>
                            <span className="xpm-val">{match.xp_per_min} X</span>
                          </div>
                          <span className="econ-label">GPM / XPM</span>
                        </div>

                        <div className="match-duration-col">
                          <span className="match-dur-val">
                            {formatDuration(match.duration)}
                          </span>
                          <span className="match-dur-lbl">Duration</span>
                        </div>
                      </div>
                    );
                  })}
                  {recentMatches.length === 0 && (
                    <p className="no-matches-txt">No recent matches found for this account.</p>
                  )}
                </div>
              </div>

              {/* Top Heroes Played */}
              <div className="player-top-heroes-panel">
                <div className="section-title">Most Played Heroes</div>
                <div className="top-heroes-list">
                  {topHeroes
                    .slice(0, 5)
                    .filter((h) => h.games > 0)
                    .map((h, index) => {
                      const hero = heroMap[h.hero_id] || {
                        name: `Hero #${h.hero_id}`,
                        img: "logo.svg",
                      };
                      const winRate = ((h.win / h.games) * 100).toFixed(1);

                      return (
                        <div key={h.hero_id || index} className="top-hero-row">
                          <img
                            src={hero.img}
                            alt={hero.name}
                            className="top-hero-thumb"
                            onError={(e) => {
                              e.target.src = "logo.svg";
                            }}
                          />
                          <div className="top-hero-stats">
                            <h4>{hero.name}</h4>
                            <div className="top-hero-progress">
                              <div
                                className="top-hero-progress-bar"
                                style={{ width: `${winRate}%` }}
                              />
                            </div>
                            <div className="top-hero-meta-txt">
                              <span>{h.games} matches</span>
                              <span className="text-winrate">{winRate}% Win Rate</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {topHeroes.length === 0 && (
                    <p className="no-matches-txt">No hero data available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
