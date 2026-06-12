import { useEffect, useMemo, useState } from "react";
import ChannelCard from "./components/ChannelCard";
import VideoPlayer from "./components/VideoPlayer";
import { channels } from "./data/channels";

const PC_DOWNLOAD_URL =
  "https://github.com/EVRARDKODIA771/Evrardfoot/releases/download/PC/EvrardFoot_PC.rar";

const ANDROID_DOWNLOAD_URL =
  "https://github.com/EVRARDKODIA771/Evrardfoot/releases/download/APK/EvrardFoot-1-v1.0.apk";

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function getPlatformInfo() {
  const ua = navigator.userAgent.toLowerCase();

  const isElectron = ua.includes("electron");

  const isCapacitor =
    typeof window !== "undefined" &&
    (window.Capacitor || window.capacitor || ua.includes("capacitor"));

  const isAndroid = ua.includes("android");

  const isTV =
    ua.includes("android tv") ||
    ua.includes("google tv") ||
    ua.includes("smart-tv") ||
    ua.includes("smarttv") ||
    ua.includes("tv") ||
    ua.includes("aft") ||
    ua.includes("bravia") ||
    ua.includes("tizen") ||
    ua.includes("webos");

  const isDesktop =
    ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux");

  return {
    isElectron,
    isCapacitor,
    isAndroid,
    isTV,
    isDesktop,
    isNativeApp: isElectron || isCapacitor,
  };
}

export default function App() {
const platform = getPlatformInfo();


  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);

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

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const savedHistory = JSON.parse(
      localStorage.getItem("watch_history") || "[]"
    );

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

  const tvItems = useMemo(() => {
    const items = [];

    items.push({
      id: "home",
      type: "tab",
      action: () => {
        setActiveTab("home");
        setSearch("");
      },
    });

    items.push({
      id: "search",
      type: "tab",
      action: () => {
        setActiveTab("search");
      },
    });

    items.push({
      id: "favorites",
      type: "tab",
      action: () => {
        setActiveTab("favorites");
        setSearch("");
      },
    });

    displayedChannels.forEach((channel) => {
      items.push({
        id: `channel-${channel.id}`,
        type: "channel",
        channel,
        action: () => openChannel(channel),
      });
    });

    return items;
  }, [displayedChannels]);

  useEffect(() => {
    if (!platform.isTV) return;
    setFocusedIndex(0);
  }, [activeTab, search, platform.isTV]);

  useEffect(() => {
    if (!platform.isTV) return;
  if (selectedChannel) return;


    const handleKeyDown = (e) => {
      const key = e.key;

      const isBack =
        key === "Backspace" ||
        key === "Escape" ||
        key === "BrowserBack" ||
        key === "GoBack" ||
        e.keyCode === 4 ||
        e.keyCode === 461;

      const isOk =
        key === "Enter" ||
        key === "NumpadEnter" ||
        e.keyCode === 13 ||
        e.keyCode === 23 ||
        e.keyCode === 66;

      const isArrow =
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight";

      if (!isBack && !isOk && !isArrow) return;

      e.preventDefault();
      e.stopPropagation();

      if (isBack) {
        if (window.history.length > 1) {
          window.history.back();
        }
        return;
      }

      if (isOk) {
        const item = tvItems[focusedIndex];
        if (item && typeof item.action === "function") item.action();
        return;
      }

      setFocusedIndex((prev) => {
        let next = prev;

        const columns =
          window.innerWidth >= 1280 ? 4 : window.innerWidth >= 640 ? 2 : 1;

        if (key === "ArrowRight") next = Math.min(prev + 1, tvItems.length - 1);
        if (key === "ArrowLeft") next = Math.max(prev - 1, 0);

        if (key === "ArrowDown") {
          next = prev < 3 ? 3 : Math.min(prev + columns, tvItems.length - 1);
        }

        if (key === "ArrowUp") {
          next =
            prev >= 3 && prev - columns < 3
              ? 0
              : Math.max(prev - columns, 0);
        }

        setTimeout(() => {
          const element = document.querySelector(`[data-tv-index="${next}"]`);
          element?.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }, 0);

        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [
  platform.isTV,
  tvItems,
  focusedIndex,
  selectedChannel,
]);

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

  const tvSelectedClass =
    "ring-4 ring-white scale-[1.04] bg-white/10 shadow-[0_0_35px_rgba(255,255,255,0.35)]";

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

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex gap-2">
              <a
                href={PC_DOWNLOAD_URL}
                className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-zinc-200"
              >
                PC
              </a>

              <a
                href={ANDROID_DOWNLOAD_URL}
                className="rounded-xl bg-zinc-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-700"
              >
                Android
              </a>

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
        </div>
      </header>

      {platform.isTV && (
        <nav className="sticky top-[73px] z-30 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-2xl">
          <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 rounded-2xl bg-white/[0.04] p-2">
            <button
              data-tv-index="0"
              onClick={() => {
                setActiveTab("home");
                setSearch("");
              }}
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                activeTab === "home"
                  ? "bg-white text-black"
                  : "text-zinc-300"
              } ${focusedIndex === 0 ? tvSelectedClass : ""}`}
            >
              Accueil
            </button>

            <button
              data-tv-index="1"
              onClick={() => setActiveTab("search")}
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                activeTab === "search"
                  ? "bg-white text-black"
                  : "text-zinc-300"
              } ${focusedIndex === 1 ? tvSelectedClass : ""}`}
            >
              Recherche
            </button>

            <button
              data-tv-index="2"
              onClick={() => {
                setActiveTab("favorites");
                setSearch("");
              }}
              className={`rounded-xl px-3 py-3 text-sm font-bold transition ${
                activeTab === "favorites"
                  ? "bg-white text-black"
                  : "text-zinc-300"
              } ${focusedIndex === 2 ? tvSelectedClass : ""}`}
            >
              Favoris
            </button>
          </div>
        </nav>
      )}

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
                    src={
                      channel.cover ||
                      channel.logo ||
                      channel.image ||
                      "/bg.jpeg"
                    }
                    alt={channel.name}
                    className="h-28 w-full bg-black object-contain p-4"
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
                <div key={i} className="h-[210px] rounded-[24px] skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {displayedChannels.map((channel, index) => {
                const tvIndex = index + 3;
                const selected = platform.isTV && focusedIndex === tvIndex;

                return (
                  <div
                    key={channel.id}
                    data-tv-index={tvIndex}
                    className={`animate-card-in rounded-[26px] transition ${
                      selected ? tvSelectedClass : ""
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ChannelCard
                      channel={channel}
                      onSelect={openChannel}
                      isFavorite={favorites.includes(channel.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {!platform.isTV && (
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
      )}

      {selectedChannel && (
        <VideoPlayer channel={selectedChannel} onClose={closeChannel} />
      )}
    </div>
  );
}
