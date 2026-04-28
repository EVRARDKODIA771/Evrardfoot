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

  // 🔥 ONE SIGNAL FIXÉ
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

    // ⚡ On laisse le temps à la WebView de charger
    setTimeout(initOneSignal, 1500);

  }, []);

  const hasSearch = search.trim().length > 0;

  const filteredChannels = useMemo(() => {
    const q = search.toLowerCase();
    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(q) ||
        channel.category.toLowerCase().includes(q)
    );
  }, [search]);

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
  };

  const closeChannel = () => {
    window.history.pushState({}, "", window.location.pathname);
    setSelectedChannel(null);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              EvrardFoot
            </h1>
            <p className="text-sm text-zinc-400">Streaming live premium</p>
          </div>

          <div className="w-full md:w-[300px]">
            <input
              type="text"
              placeholder="Rechercher une chaîne..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 transition focus:border-white/20 focus:bg-white/[0.06]"
            />
          </div>
        </div>
      </header>

      <main className="pb-16">
        {!hasSearch && (
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

        <section
          className={`mx-auto max-w-7xl px-4 md:px-8 ${
            hasSearch ? "pt-10" : "pt-6"
          }`}
        >
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                {hasSearch ? "Résultats de recherche" : "Chaînes disponibles"}
              </h3>

              <p className="text-sm text-zinc-400">
                {hasSearch
                  ? `Résultats pour "${search}"`
                  : "Mosaïque paysage, style épuré, ambiance cinéma"}
              </p>
            </div>

            <div className="text-sm text-zinc-500">
              {filteredChannels.length} résultat
              {filteredChannels.length > 1 ? "s" : ""}
            </div>
          </div>

          {hasSearch && filteredChannels.length === 0 && (
            <div className="flex items-center justify-center py-20 text-center text-zinc-500">
              Aucune chaîne trouvée pour "{search}"
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onSelect={openChannel}
              />
            ))}
          </div>
        </section>
      </main>

      {selectedChannel && (
        <VideoPlayer channel={selectedChannel} onClose={closeChannel} />
      )}
    </div>
  );
}
