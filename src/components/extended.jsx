import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function Extended() {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [channels, setChannels] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCategories();
    loadChannels();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  async function safeJson(res) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        `Réponse invalide du serveur. Status ${res.status}. Vérifie que la route API existe.`
      );
    }
  }

  async function loadCategories() {
    try {
      setError("");

      const res = await fetch("/api/iptv/categories");
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Erreur chargement catégories");
      }

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadChannels(categoryId = null) {
    try {
      setLoading(true);
      setError("");

      const url = categoryId
        ? `/api/iptv/channels?category_id=${categoryId}`
        : "/api/iptv/channels";

      const res = await fetch(url);
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Erreur chargement chaînes");
      }

      setChannels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }

  async function playChannel(channel) {
    try {
      setActiveChannel(channel);
      setError("");

      const res = await fetch(`/api/iptv/stream?stream_id=${channel.stream_id}`);
      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.message || "Erreur chargement du stream");
      }

      const video = videoRef.current;
      if (!video || !data.url) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;

        hls.loadSource(data.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (_, eventData) => {
          if (eventData?.fatal) {
            setError("Impossible de lire cette chaîne.");
          }
        });
      } else {
        video.src = data.url;
        video.play().catch(() => {});
      }
    } catch (err) {
      setError(err.message);
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
        <div style={styles.sidebarTop}>
          <div>
            <h1 style={styles.logo}>EvrardTV</h1>
            <p style={styles.sidebarSub}>IPTV Premium</p>
          </div>

          <a href="/" style={styles.backBtn}>
            Retour
          </a>
        </div>

        <button
          style={{
            ...styles.categoryBtn,
            background: activeCategory === null ? "#3f3f46" : "transparent",
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
                  activeCategory === cat.category_id ? "#3f3f46" : "transparent",
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

            {error && <div style={styles.errorBox}>{error}</div>}
          </div>

          <div style={styles.playerBox}>
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
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

        {loading ? (
          <div style={styles.loadingBox}>Chargement des chaînes...</div>
        ) : (
          <section style={styles.grid}>
            {filteredChannels.map((channel) => (
              <button
                key={channel.stream_id}
                style={{
                  ...styles.card,
                  border:
                    activeChannel?.stream_id === channel.stream_id
                      ? "1px solid #d4d4d8"
                      : "1px solid rgba(255,255,255,0.08)",
                }}
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
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background:
      "radial-gradient(circle at top left, #27272a 0%, #111111 38%, #000000 100%)",
    color: "white",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    width: 280,
    padding: 24,
    background: "rgba(0,0,0,0.72)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    height: "100vh",
    overflowY: "auto",
    position: "sticky",
    top: 0,
  },

  sidebarTop: {
    marginBottom: 28,
  },

  logo: {
    fontSize: 34,
    fontWeight: 900,
    color: "#f4f4f5",
    margin: 0,
    letterSpacing: -1,
  },

  sidebarSub: {
    marginTop: 4,
    marginBottom: 16,
    color: "#a1a1aa",
    fontSize: 13,
  },

  backBtn: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    textDecoration: "none",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: "11px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
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
    color: "#d4d4d8",
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

  errorBox: {
    marginTop: 18,
    padding: "12px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#f4f4f5",
    fontSize: 14,
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

  loadingBox: {
    padding: 32,
    borderRadius: 18,
    background: "rgba(255,255,255,0.06)",
    color: "#bbb",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    overflow: "hidden",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
    transition: "transform 0.2s ease, background 0.2s ease",
  },

  poster: {
    height: 120,
    background: "linear-gradient(135deg, #27272a, #050505)",
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
    color: "#d4d4d8",
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
    color: "#d4d4d8",
    fontSize: 12,
    fontWeight: 900,
  },
};
