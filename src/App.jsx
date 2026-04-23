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
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_28%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_20%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_25%,transparent_75%,rgba(255,255,255,0.02))]" />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                EvrardFoot
              </h1>
              <p className="text-sm text-zinc-400">
                Streaming live premium
              </p>
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
          <section className="mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-8 md:pt-14">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_10px_60px_rgba(0,0,0,0.45)] md:p-10">
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                Live TV • Interface moderne
              </div>

              <h2 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Une expérience streaming
                <span className="block text-zinc-400">
                  sobre, fluide et haut de gamme.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                Parcours tes chaînes dans une mosaïque élégante, ouvre un lecteur
                intégré, et profite d’une interface pensée pour être propre,
                lisible et premium sur desktop comme sur mobile.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                  {channels.length} chaînes disponibles
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                  Lecteur intégré
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                  Compatible mobile
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Chaînes disponibles
                </h3>
                <p className="text-sm text-zinc-400">
                  Mosaïque paysage, style épuré, ambiance cinéma
                </p>
              </div>

              <div className="text-sm text-zinc-500">
                {filteredChannels.length} résultat{filteredChannels.length > 1 ? "s" : ""}
              </div>
            </div>

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
      </div>

      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={closeChannel}
        />
      )}
    </div>
  );
}
