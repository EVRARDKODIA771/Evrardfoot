import { useEffect, useMemo, useState } from "react";
import OneSignal from "onesignal-cordova-plugin";
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

  useEffect(() => {
    const initOneSignal = async () => {
      try {
        if (!window.Capacitor) {
          console.log("Mode web → OneSignal désactivé");
          return;
        }

        console.log("Capacitor détecté → init OneSignal");

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
    if (activeTab === "search") return filteredChannels;
    return filteredChannels;
  }, [activeTab, favoriteChannels, filteredChannels]);

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
      : hasSearch || activeTab === "search"
      ? "Résultats de recherche"
      : "Chaînes disponibles";

  const sectionSubtitle =
    activeTab === "favorites"
      ? "Tes chaînes sauvegardées sur cet appareil"
      : hasSearch || activeTab === "search"
      ? `Résultats pour "${search}"`
      : "Mosaïque paysage, style épuré, ambiance cinéma";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] pb-20 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              EvrardFoot
            </h1>
            <p className="text-sm text-zinc-400">Streaming live premium</p>
          </div>

          <div className="w-full md:w-[340px]">
            <input
              type="text"
              placeholder="Rechercher une chaîne..."
              value={search}
              onFocus={() => setActiveTab("search")}
              onChange={(e) => {
                setSearch(e.target.value);
                setActiveTab("search");
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 transition focus:border-white/20 focus:bg-white/[0.06]"
            />
          </div>
        </div>
      </header>

      <main>
        {activeTab === "home" && !hasSearch && (
          <section className="relative h-[70vh] w-full overflow-hidden">
            <img
              src="/bg.jpeg"
              alt="football background"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 md:px-10">
              <div className="max-w-2xl">
                <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 backdrop-blur-md">
                  Live TV • Football • Premium
                </div>

                <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                  Regarde le football
                  <span className="block text-zinc-400">
                    comme jamais auparavant.
                  </span>
                </h2>

                <p className="mt-5 text-base leading-7 text-zinc-300 md:text-lg">
                  Accède à tes chaînes sportives en direct avec une expérience
                  fluide, immersive et pensée pour tous tes écrans.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "home" && historyChannels.length > 0 && !hasSearch && (
          <section className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
            <div className="mb-4">
              <h3 className="text-xl font-bold tracking-tight">
                Continuer à regarder
              </h3>
              <p className="text-sm text-zinc-400">
                Tes dernières chaînes ouvertes
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {historyChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => openChannel(channel)}
                  className="min-w-[210px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] text-left transition hover:bg-white/[0.08]"
                >
                  <img
                    src={channel.cover || channel.logo || channel.image || "/bg.jpeg"}
                    alt={channel.name}
                    className="h-28 w-full object-contain bg-black p-4"
                  />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">
                      {channel.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {channel.category}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section
          className={`mx-auto max-w-7xl px-4 md:px-8 ${
            activeTab === "home" && !hasSearch ? "pt-8" : "pt-10"
          }`}
        >
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {sectionTitle}
              </h3>

              <p className="text-sm text-zinc-400">{sectionSubtitle}</p>
            </div>

            <div className="text-sm text-zinc-500">
              {displayedChannels.length} résultat
              {displayedChannels.length > 1 ? "s" : ""}
            </div>
          </div>

          {!loading && displayedChannels.length === 0 && (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] py-20 text-center text-zinc-500">
              {activeTab === "favorites"
                ? "Aucun favori pour le moment."
                : `Aucune chaîne trouvée pour "${search}"`}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-[210px] rounded-[24px] skeleton"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {displayedChannels.map((channel, index) => (
                <div
                  key={channel.id}
                  className="animate-card-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ChannelCard
                    channel={channel}
                    onSelect={openChannel}
                    isFavorite={favorites.includes(channel.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/85 px-4 py-3 backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 rounded-2xl bg-white/[0.04] p-1">
          <button
            onClick={() => {
              setActiveTab("home");
              setSearch("");
            }}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === "home"
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Accueil
          </button>

          <button
            onClick={() => setActiveTab("search")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === "search"
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Recherche
          </button>

          <button
            onClick={() => {
              setActiveTab("favorites");
              setSearch("");
            }}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              activeTab === "favorites"
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Favoris
          </button>
        </div>
      </nav>

      {selectedChannel && (
        <VideoPlayer channel={selectedChannel} onClose={closeChannel} />
      )}
    </div>
  );
}
