import { useEffect, useMemo, useState } from "react";
import ChannelCard from "./components/ChannelCard";
import VideoPlayer from "./components/VideoPlayer";
import { channels } from "./data/channels";

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export default function App() {
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Init stockage local
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const savedHistory = JSON.parse(localStorage.getItem("watch_history") || "[]");

    setFavorites(savedFavorites);
    setHistory(savedHistory);

    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("watch_history", JSON.stringify(history));
  }, [history]);

  // 🔥 FIX ONESIGNAL (WEB + MOBILE)
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        const isNative =
          typeof window !== "undefined" &&
          window.Capacitor &&
          window.Capacitor.isNativePlatform?.();

        if (!isNative) {
          console.log("Mode web → OneSignal désactivé");
          return;
        }

        console.log("Capacitor détecté → init OneSignal");

        const module = await import("onesignal-cordova-plugin");
        const OneSignal = module.default || module;

        OneSignal.initialize("e42fc362-9e1e-40c5-a851-f3a5d3863a2c");

        const accepted = await OneSignal.Notifications.requestPermission(true);
        console.log("Permission notifications:", accepted);
      } catch (error) {
        console.log("Erreur OneSignal :", error);
      }
    };

    setTimeout(initOneSignal, 1500);
  }, []);

  const hasSearch = search.trim().length > 0;

  const filteredChannels = useMemo(() => {
    const q = search.toLowerCase().trim();

    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(q) ||
        channel.category.toLowerCase().includes(q)
    );
  }, [search]);

  const favoriteChannels = useMemo(() => {
    return channels.filter((channel) => favorites.includes(channel.id));
  }, [favorites]);

  const historyChannels = useMemo(() => {
    return history
      .map((id) => channels.find((channel) => channel.id === id))
      .filter(Boolean);
  }, [history]);

  const displayedChannels = useMemo(() => {
    if (activeTab === "favorites") return favoriteChannels;
    return filteredChannels;
  }, [activeTab, favoriteChannels, filteredChannels]);

  // 🔹 Sync URL
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id");

      if (!idParam) {
        setSelectedChannel(null);
        return;
      }

      const id = Number(idParam);
      const found = channels.find((channel) => channel.id === id) || null;
      setSelectedChannel(found);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  const openChannel = (channel) => {
    const params = new URLSearchParams();
    params.set("id", String(channel.id));
    params.set("name", slugify(channel.name));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);

    setSelectedChannel(channel);

    setHistory((prev) => {
      const next = [channel.id, ...prev.filter((id) => id !== channel.id)];
      return next.slice(0, 12);
    });
  };

  const closeChannel = () => {
    window.history.pushState({}, "", window.location.pathname);
    setSelectedChannel(null);
  };

  const toggleFavorite = (channelId) => {
    setFavorites((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const sectionTitle =
    activeTab === "favorites"
      ? "Mes chaînes favorites"
      : hasSearch
      ? "Résultats de recherche"
      : "Chaînes disponibles";

  const sectionSubtitle =
    activeTab === "favorites"
      ? "Tes chaînes sauvegardées sur cet appareil"
      : hasSearch
      ? `Résultats pour "${search}"`
      : "Mosaïque premium";

  return (
    <div className="relative min-h-screen bg-[#050505] pb-20 text-white">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:justify-between md:px-8">
          <div>
            <h1 className="text-2xl font-black">EvrardFoot</h1>
            <p className="text-sm text-zinc-400">Streaming live premium</p>
          </div>

          <input
            type="text"
            placeholder="Rechercher une chaîne..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveTab("search");
            }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white"
          />
        </div>
      </header>

      {/* LISTE */}
      <main className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <h3 className="text-2xl font-bold">{sectionTitle}</h3>
        <p className="text-sm text-zinc-400">{sectionSubtitle}</p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {displayedChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onSelect={openChannel}
              isFavorite={favorites.includes(channel.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </main>

      {/* PLAYER */}
      {selectedChannel && (
        <VideoPlayer channel={selectedChannel} onClose={closeChannel} />
      )}
    </div>
  );
}
