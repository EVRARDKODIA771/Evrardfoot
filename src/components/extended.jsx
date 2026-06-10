import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function Extended() {
  const videoRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [channels, setChannels] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadChannels();
  }, []);

  async function loadCategories() {
    const res = await fetch("/api/iptv/categories");
    const data = await res.json();
    setCategories(data || []);
  }

  async function loadChannels(categoryId = null) {
    setLoading(true);

    const url = categoryId
      ? `/api/iptv/channels?category_id=${categoryId}`
      : "/api/iptv/channels";

    const res = await fetch(url);
    const data = await res.json();

    setChannels(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function playChannel(channel) {
    setActiveChannel(channel);

    const res = await fetch(`/api/iptv/stream?stream_id=${channel.stream_id}`);
    const data = await res.json();

    const video = videoRef.current;
    if (!video || !data.url) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(data.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else {
      video.src = data.url;
      video.play();
    }
  }

  function selectCategory(cat) {
    setActiveCategory(cat.category_id);
    loadChannels(cat.category_id);
  }

  const filteredChannels = channels.filter((ch) =>
    ch.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <h1 style={styles.logo}>EvrardTV</h1>

        <button
          style={{
            ...styles.categoryBtn,
            background: activeCategory === null ? "#e50914" : "transparent",
          }}
          onClick={() => {
            setActiveCategory(null);
            loadChannels();
          }}
        >
          Toutes les chaînes
        </button>

        <div style={styles.categoryList}>
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              style={{
                ...styles.categoryBtn,
                background:
                  activeCategory === cat.category_id ? "#e50914" : "transparent",
              }}
              onClick={() => selectCategory(cat)}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      </aside>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroText}>
            <p style={styles.kicker}>LIVE IPTV</p>
            <h2 style={styles.title}>
              {activeChannel ? activeChannel.name : "Choisis une chaîne"}
            </h2>
            <p style={styles.subtitle}>
              Interface fluide, moderne, pensée comme une plateforme premium.
            </p>
          </div>

          <div style={styles.playerBox}>
            <video
              ref={videoRef}
              controls
              autoPlay
              style={styles.video}
              poster={activeChannel?.stream_icon || ""}
            />
          </div>
        </section>

        <div style={styles.topBar}>
          <h3 style={styles.sectionTitle}>
            {loading ? "Chargement..." : `${filteredChannels.length} chaînes`}
          </h3>

          <input
            style={styles.search}
            placeholder="Rechercher une chaîne..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <section style={styles.grid}>
          {filteredChannels.map((channel) => (
            <button
              key={channel.stream_id}
              style={styles.card}
              onClick={() => playChannel(channel)}
            >
              <div style={styles.poster}>
                {channel.stream_icon ? (
                  <img
                    src={channel.stream_icon}
                    alt={channel.name}
                    style={styles.icon}
                  />
                ) : (
                  <span style={styles.fallback}>TV</span>
                )}
              </div>

              <div style={styles.cardInfo}>
                <strong style={styles.channelName}>{channel.name}</strong>
                <span style={styles.liveBadge}>● LIVE</span>
              </div>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background:
      "radial-gradient(circle at top left, #2b0000 0%, #080808 35%, #000 100%)",
    color: "white",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    width: 280,
    padding: 24,
    background: "rgba(0,0,0,0.65)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    height: "100vh",
    overflowY: "auto",
    position: "sticky",
    top: 0,
  },

  logo: {
    fontSize: 34,
    fontWeight: 900,
    color: "#e50914",
    marginBottom: 32,
    letterSpacing: -1,
  },

  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  categoryBtn: {
    width: "100%",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },

  main: {
    flex: 1,
    padding: 32,
    overflowX: "hidden",
  },

  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 520px",
    gap: 32,
    alignItems: "center",
    marginBottom: 32,
  },

  heroText: {
    maxWidth: 680,
  },

  kicker: {
    color: "#e50914",
    fontWeight: 900,
    letterSpacing: 2,
  },

  title: {
    fontSize: 56,
    lineHeight: 1,
    margin: "12px 0",
    fontWeight: 900,
  },

  subtitle: {
    color: "#cfcfcf",
    fontSize: 18,
  },

  playerBox: {
    background: "#111",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
    border: "1px solid rgba(255,255,255,0.1)",
  },

  video: {
    width: "100%",
    height: 300,
    background: "#000",
    objectFit: "contain",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 24,
    margin: 0,
  },

  search: {
    width: 320,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "white",
    padding: "13px 16px",
    borderRadius: 999,
    outline: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    overflow: "hidden",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
    transition: "transform 0.2s ease, background 0.2s ease",
  },

  poster: {
    height: 120,
    background: "linear-gradient(135deg, #222, #050505)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    maxWidth: "80%",
    maxHeight: "80%",
    objectFit: "contain",
  },

  fallback: {
    fontSize: 28,
    fontWeight: 900,
    color: "#e50914",
  },

  cardInfo: {
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  channelName: {
    fontSize: 14,
    lineHeight: 1.25,
  },

  liveBadge: {
    color: "#e50914",
    fontSize: 12,
    fontWeight: 900,
  },
};
