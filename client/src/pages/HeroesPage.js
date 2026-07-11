import { useState, useEffect, useMemo } from "react";

export default function HeroesPage() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttr, setSelectedAttr] = useState("any");
  const [selectedRole, setSelectedRole] = useState("any");
  const [selectedHero, setSelectedHero] = useState(null);

  // Abilities and Items caches
  const [heroAbilitiesMap, setHeroAbilitiesMap] = useState(null);
  const [abilitiesMap, setAbilitiesMap] = useState(null);
  const [itemsMap, setItemsMap] = useState(null);
  const [itemIdMap, setItemIdMap] = useState({});

  // Hero specific dynamic stats
  const [itemPopularity, setItemPopularity] = useState(null);
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [modalTab, setModalTab] = useState("stats"); // 'stats', 'skills', 'builds'
  const [activeAbility, setActiveAbility] = useState(null);

  // Fetch base hero roster
  useEffect(() => {
    fetch("https://api.opendota.com/api/heroStats")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setHeroes(data);
          setError(null);
        } else {
          throw new Error("API returned non-array payload");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching heroes:", err);
        setError("Failed to load hero database. You might be rate-limited by OpenDota API. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Fetch static abilities and items data on demand when modal opens
  useEffect(() => {
    if (!selectedHero) {
      setItemPopularity(null);
      setModalTab("stats");
      setActiveAbility(null);
      return;
    }

    setLoadingModalData(true);

    const fetches = [
      fetch(`https://api.opendota.com/api/heroes/${selectedHero.id}/itemPopularity`).then((res) => res.json())
    ];

    const needsHeroAbilities = !heroAbilitiesMap;
    const needsAbilitiesMap = !abilitiesMap;
    const needsItemsMap = !itemsMap;

    if (needsHeroAbilities) {
      fetches.push(
        fetch("https://raw.githubusercontent.com/odota/dotaconstants/master/build/hero_abilities.json").then((res) => res.json())
      );
    }
    if (needsAbilitiesMap) {
      fetches.push(
        fetch("https://raw.githubusercontent.com/odota/dotaconstants/master/build/abilities.json").then((res) => res.json())
      );
    }
    if (needsItemsMap) {
      fetches.push(
        fetch("https://raw.githubusercontent.com/odota/dotaconstants/master/build/items.json").then((res) => res.json())
      );
    }

    Promise.all(fetches)
      .then((results) => {
        let index = 0;
        const popularity = results[index++];
        setItemPopularity(popularity);

        if (needsHeroAbilities) {
          const data = results[index++];
          setHeroAbilitiesMap(data);
        }
        if (needsAbilitiesMap) {
          const data = results[index++];
          setAbilitiesMap(data);
        }
        if (needsItemsMap) {
          const data = results[index++];
          setItemsMap(data);
          
          // Build ID-based map for items lookup
          const idMap = {};
          Object.keys(data).forEach((itemName) => {
            const item = data[itemName];
            idMap[item.id] = {
              name: itemName,
              ...item
            };
          });
          setItemIdMap(idMap);
        }
        setLoadingModalData(false);
      })
      .catch((err) => {
        console.error("Error fetching modal stats:", err);
        setLoadingModalData(false);
      });
  }, [selectedHero, abilitiesMap, heroAbilitiesMap, itemsMap]);

  // Build ID-based map if itemsMap was already cached but component state resets
  useEffect(() => {
    if (itemsMap && Object.keys(itemIdMap).length === 0) {
      const idMap = {};
      Object.keys(itemsMap).forEach((itemName) => {
        const item = itemsMap[itemName];
        idMap[item.id] = {
          name: itemName,
          ...item
        };
      });
      setItemIdMap(idMap);
    }
  }, [itemsMap, itemIdMap]);

  const rolesList = [
    "Carry",
    "Support",
    "Nuker",
    "Disabler",
    "Jungler",
    "Durable",
    "Escape",
    "Pusher",
    "Initiator"
  ];

  // Filtering logic
  const filteredHeroes = Array.isArray(heroes)
    ? heroes.filter((hero) => {
        const matchesName = hero.localized_name
          ? hero.localized_name.toLowerCase().includes(searchTerm.toLowerCase())
          : false;
        
        const matchesAttr =
          selectedAttr === "any" || hero.primary_attr === selectedAttr;
        
        const matchesRole =
          selectedRole === "any" || (hero.roles && hero.roles.includes(selectedRole));

        return matchesName && matchesAttr && matchesRole;
      })
    : [];

  const getAttrLabel = (attr) => {
    switch (attr) {
      case "str":
        return "Strength";
      case "agi":
        return "Agility";
      case "int":
        return "Intelligence";
      case "all":
        return "Universal";
      default:
        return attr;
    }
  };

  const getAttrClass = (attr) => {
    switch (attr) {
      case "str":
        return "attr-str";
      case "agi":
        return "attr-agi";
      case "int":
        return "attr-int";
      case "all":
        return "attr-uni";
      default:
        return "";
    }
  };

  // Get active hero abilities list
  const currentHeroAbilities = useMemo(() => {
    const list = [];
    if (selectedHero && heroAbilitiesMap && abilitiesMap) {
      const heroName = selectedHero.name;
      const entry = heroAbilitiesMap[heroName];
      if (entry && entry.abilities) {
        entry.abilities.forEach((abName) => {
          const details = abilitiesMap[abName];
          if (
            details &&
            details.dname &&
            details.img &&
            !abName.startsWith("special_bonus_") &&
            abName !== "generic_hidden"
          ) {
            list.push({
              name: abName,
              ...details
            });
          }
        });
      }
    }
    return list;
  }, [selectedHero, heroAbilitiesMap, abilitiesMap]);

  // Set default active ability in tab
  useEffect(() => {
    if (currentHeroAbilities.length > 0 && !activeAbility) {
      setActiveAbility(currentHeroAbilities[0]);
    }
  }, [currentHeroAbilities, activeAbility]);

  // Resolve popular items helper
  const resolvePopularItems = (popularityGroup) => {
    if (!popularityGroup || Object.keys(itemIdMap).length === 0) return [];
    return Object.entries(popularityGroup)
      .map(([id, count]) => {
        const itemDetails = itemIdMap[id];
        return {
          item: itemDetails,
          count
        };
      })
      .filter((entry) => entry.item !== undefined)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const cleanHeroName = selectedHero
    ? selectedHero.name.replace("npc_dota_hero_", "")
    : "";

  return (
    <>
      <div className="heroes-page fade-up">
      {/* Hero Header */}
      <div className="index-hero">
        <span className="index-hero-eyebrow"><span>✦</span> Codex Database</span>
        <h1 className="index-title">
          Dota 2 <span>Heroes</span>
        </h1>
        <p className="index-subtitle">
          Explore and filter through the complete roster of heroes and their base stats.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="filter-bar">
        <div className="search-box">
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
            placeholder="Search hero name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-group">
          {/* Attributes Select */}
          <div className="attr-filters">
            <button
              className={`filter-btn ${selectedAttr === "any" ? "active" : ""}`}
              onClick={() => setSelectedAttr("any")}
            >
              All Attributes
            </button>
            <button
              className={`filter-btn attr-str-btn ${
                selectedAttr === "str" ? "active" : ""
              }`}
              onClick={() => setSelectedAttr("str")}
            >
              Strength
            </button>
            <button
              className={`filter-btn attr-agi-btn ${
                selectedAttr === "agi" ? "active" : ""
              }`}
              onClick={() => setSelectedAttr("agi")}
            >
              Agility
            </button>
            <button
              className={`filter-btn attr-int-btn ${
                selectedAttr === "int" ? "active" : ""
              }`}
              onClick={() => setSelectedAttr("int")}
            >
              Intelligence
            </button>
            <button
              className={`filter-btn attr-uni-btn ${
                selectedAttr === "all" ? "active" : ""
              }`}
              onClick={() => setSelectedAttr("all")}
            >
              Universal
            </button>
          </div>

          {/* Role Dropdown */}
          <div className="role-filter">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-select"
            >
              <option value="any">All Roles</option>
              {rolesList.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Error Indicator */}
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Loading Hero Codex...</p>
        </div>
      ) : error ? (
        <div className="posts-empty">
          <div className="posts-empty-icon">⚠️</div>
          <p className="lookup-error" style={{ marginTop: 0 }}>{error}</p>
        </div>
      ) : (
        <>
          <div className="heroes-count">
            Showing {filteredHeroes.length} of {heroes.length} heroes
          </div>

          {/* Grid list */}
          <div className="heroes-grid">
            {filteredHeroes.map((hero) => (
              <div
                key={hero.id}
                className="hero-grid-card"
                onClick={() => setSelectedHero(hero)}
              >
                <div className="hero-card-img-wrapper">
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com${hero.img}`}
                    alt={hero.localized_name}
                    loading="lazy"
                  />
                  <div className="hero-card-overlay">
                    <span className="view-details-txt">View Stats</span>
                  </div>
                </div>
                <div className="hero-card-info">
                  <span className={`hero-attr-tag ${getAttrClass(hero.primary_attr)}`}>
                    {getAttrLabel(hero.primary_attr)}
                  </span>
                  <h3>{hero.localized_name}</h3>
                  <div className="hero-card-roles">
                    {hero.roles.slice(0, 3).join(" • ")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredHeroes.length === 0 && (
            <div className="posts-empty">
              <div className="posts-empty-icon">🛡️</div>
              <p>No heroes matches your search filters.</p>
            </div>
          )}
        </>
      )}
      </div>

      {/* Details Modal */}
      {selectedHero && (
        <div className="modal-overlay" onClick={() => setSelectedHero(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedHero(null)}>
              &times;
            </button>
            <div className="hero-modal-grid">
              {/* Left Column (Hero portrait + basic details) */}
              <div className="hero-modal-left">
                <img
                  src={`https://cdn.cloudflare.steamstatic.com${selectedHero.img}`}
                  alt={selectedHero.localized_name}
                  className="modal-hero-img"
                />
                <h2>{selectedHero.localized_name}</h2>
                <div className="modal-hero-sub">
                  <span className={`hero-attr-tag ${getAttrClass(selectedHero.primary_attr)}`}>
                    {getAttrLabel(selectedHero.primary_attr)}
                  </span>
                  <span className="modal-attack-type">{selectedHero.attack_type}</span>
                </div>
                <div className="modal-roles-list">
                  {selectedHero.roles.map((role) => (
                    <span key={role} className="modal-role-chip">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column (Tabs for detailed stats, skills, builds) */}
              <div className="hero-modal-right">
                <div className="modal-tabs">
                  <button
                    className={`modal-tab-btn ${modalTab === "stats" ? "active" : ""}`}
                    onClick={() => setModalTab("stats")}
                  >
                    Base Stats
                  </button>
                  <button
                    className={`modal-tab-btn ${modalTab === "skills" ? "active" : ""}`}
                    onClick={() => setModalTab("skills")}
                  >
                    Abilities &amp; Skills
                  </button>
                  <button
                    className={`modal-tab-btn ${modalTab === "builds" ? "active" : ""}`}
                    onClick={() => setModalTab("builds")}
                  >
                    Build Guides
                  </button>
                </div>

                {loadingModalData ? (
                  <div className="loader-container" style={{ padding: "40px 0" }}>
                    <div className="spinner"></div>
                    <p>Loading database information...</p>
                  </div>
                ) : (
                  <div className="modal-tab-body">
                    {/* Tab 1: Stats */}
                    {modalTab === "stats" && (
                      <div className="tab-pane-fade">
                        <div className="modal-section-title">Base Attributes</div>
                        <div className="stats-grid">
                          <div className="stat-row">
                            <span className="stat-label">Health</span>
                            <span className="stat-value text-health">
                              {selectedHero.base_health} (+{selectedHero.base_health_regen})
                            </span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Mana</span>
                            <span className="stat-value text-mana">
                              {selectedHero.base_mana} (+{selectedHero.base_mana_regen})
                            </span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Base Armor</span>
                            <span className="stat-value">{selectedHero.base_armor}</span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Base Attack</span>
                            <span className="stat-value">
                              {selectedHero.base_attack_min} - {selectedHero.base_attack_max}
                            </span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Move Speed</span>
                            <span className="stat-value">{selectedHero.move_speed}</span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Attack Range</span>
                            <span className="stat-value">{selectedHero.attack_range}</span>
                          </div>
                        </div>

                        <div className="modal-section-title">Attribute Growth</div>
                        <div className="stats-grid">
                          <div className="stat-row">
                            <span className="stat-label">Strength</span>
                            <span className="stat-value text-str">
                              {selectedHero.base_str} <span className="stat-gain">+{selectedHero.str_gain}</span>
                            </span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Agility</span>
                            <span className="stat-value text-agi">
                              {selectedHero.base_agi} <span className="stat-gain">+{selectedHero.agi_gain}</span>
                            </span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Intelligence</span>
                            <span className="stat-value text-int">
                              {selectedHero.base_int} <span className="stat-gain">+{selectedHero.int_gain}</span>
                            </span>
                          </div>
                        </div>

                        <div className="modal-section-title">Pro Performance</div>
                        <div className="stats-grid">
                          <div className="stat-row">
                            <span className="stat-label">Pro Wins / Picks</span>
                            <span className="stat-value">
                              {selectedHero.pro_win} / {selectedHero.pro_pick}
                            </span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Pro Win Rate</span>
                            <span className="stat-value text-winrate">
                              {selectedHero.pro_pick > 0
                                ? `${((selectedHero.pro_win / selectedHero.pro_pick) * 100).toFixed(1)}%`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Pro Bans</span>
                            <span className="stat-value">{selectedHero.pro_ban || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Abilities & Skills */}
                    {modalTab === "skills" && (
                      <div className="tab-pane-fade">
                        <div className="modal-skills-layout">
                          <div className="skills-selector">
                            {currentHeroAbilities.map((ab) => (
                              <img
                                key={ab.name}
                                src={`https://cdn.cloudflare.steamstatic.com${ab.img}`}
                                alt={ab.dname}
                                className={`skill-icon-thumb ${
                                  activeAbility?.name === ab.name ? "active" : ""
                                }`}
                                onClick={() => setActiveAbility(ab)}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/generic_hidden.png";
                                }}
                              />
                            ))}
                          </div>

                          {activeAbility && (
                            <div className="active-skill-detail">
                              <div className="skill-video-preview">
                                <video
                                  key={activeAbility.name}
                                  src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/videos/dota_react/abilities/${cleanHeroName}/${activeAbility.name}.mp4`}
                                  autoPlay
                                  loop
                                  muted
                                  controls
                                  playsInline
                                />
                              </div>
                              <div className="skill-text-info">
                                <h3>{activeAbility.dname}</h3>
                                <p className="skill-desc">{activeAbility.desc}</p>
                                {activeAbility.lore && (
                                  <p className="skill-lore">"{activeAbility.lore}"</p>
                                )}
                                <div className="skill-stats-row">
                                  {activeAbility.cd && (
                                    <span className="skill-stat-badge">
                                      ⏱ Cooldown:{" "}
                                      {Array.isArray(activeAbility.cd)
                                        ? activeAbility.cd.join(" / ")
                                        : activeAbility.cd}
                                      s
                                    </span>
                                  )}
                                  {activeAbility.mc && (
                                    <span className="skill-stat-badge">
                                      💧 Mana:{" "}
                                      {Array.isArray(activeAbility.mc)
                                        ? activeAbility.mc.join(" / ")
                                        : activeAbility.mc}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {currentHeroAbilities.length === 0 && (
                            <p className="no-matches-txt">No skills statistics loaded.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Build Guides */}
                    {modalTab === "builds" && (
                      <div className="tab-pane-fade">
                        <div className="modal-builds-layout">
                          {/* Starting Items */}
                          <div className="build-phase-column">
                            <h4>Starting Items</h4>
                            <div className="items-list-row">
                              {resolvePopularItems(itemPopularity?.start_game_items).map(
                                ({ item }) => (
                                  <div key={item.id} className="build-item-card" title={item.dname}>
                                    <img
                                      src={`https://cdn.cloudflare.steamstatic.com${
                                        item.img.split("?")[0]
                                      }`}
                                      alt={item.dname}
                                    />
                                    <span className="build-item-name">{item.dname}</span>
                                    <span className="build-item-cost">💰 {item.cost}</span>
                                  </div>
                                )
                              )}
                              {resolvePopularItems(itemPopularity?.start_game_items).length === 0 && (
                                <span className="no-items-txt">No items recommended</span>
                              )}
                            </div>
                          </div>

                          {/* Early Game */}
                          <div className="build-phase-column">
                            <h4>Early Game Items</h4>
                            <div className="items-list-row">
                              {resolvePopularItems(itemPopularity?.early_game_items).map(
                                ({ item }) => (
                                  <div key={item.id} className="build-item-card" title={item.dname}>
                                    <img
                                      src={`https://cdn.cloudflare.steamstatic.com${
                                        item.img.split("?")[0]
                                      }`}
                                      alt={item.dname}
                                    />
                                    <span className="build-item-name">{item.dname}</span>
                                    <span className="build-item-cost">💰 {item.cost}</span>
                                  </div>
                                )
                              )}
                              {resolvePopularItems(itemPopularity?.early_game_items).length === 0 && (
                                <span className="no-items-txt">No items recommended</span>
                              )}
                            </div>
                          </div>

                          {/* Mid Game */}
                          <div className="build-phase-column">
                            <h4>Core Mid Game</h4>
                            <div className="items-list-row">
                              {resolvePopularItems(itemPopularity?.mid_game_items).map(
                                ({ item }) => (
                                  <div key={item.id} className="build-item-card" title={item.dname}>
                                    <img
                                      src={`https://cdn.cloudflare.steamstatic.com${
                                        item.img.split("?")[0]
                                      }`}
                                      alt={item.dname}
                                    />
                                    <span className="build-item-name">{item.dname}</span>
                                    <span className="build-item-cost">💰 {item.cost}</span>
                                  </div>
                                )
                              )}
                              {resolvePopularItems(itemPopularity?.mid_game_items).length === 0 && (
                                <span className="no-items-txt">No items recommended</span>
                              )}
                            </div>
                          </div>

                          {/* Late Game */}
                          <div className="build-phase-column">
                            <h4>Late Game / Luxury</h4>
                            <div className="items-list-row">
                              {resolvePopularItems(itemPopularity?.late_game_items).map(
                                ({ item }) => (
                                  <div key={item.id} className="build-item-card" title={item.dname}>
                                    <img
                                      src={`https://cdn.cloudflare.steamstatic.com${
                                        item.img.split("?")[0]
                                      }`}
                                      alt={item.dname}
                                    />
                                    <span className="build-item-name">{item.dname}</span>
                                    <span className="build-item-cost">💰 {item.cost}</span>
                                  </div>
                                )
                              )}
                              {resolvePopularItems(itemPopularity?.late_game_items).length === 0 && (
                                <span className="no-items-txt">No items recommended</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
