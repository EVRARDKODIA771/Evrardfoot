import { useMemo, useState } from "react";
import ChannelCard from "./components/ChannelCard";
import VideoPlayer from "./components/VideoPlayer";
import { channels } from "./data/channels";

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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.1),_transparent_25%)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-green-400">
                EvrardFoot
              </h1>
              <p className="text-sm text-zinc-400">
                Plateforme IPTV verte et noire
              </p>
            </div>

            <input
              type="text"
              placeholder="Rechercher une chaîne..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 md:w-[260px]"
            />
          </div>
        </header>

        <main className="pb-14">
          <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 md:px-8">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-300">
                  Streaming live • Interface premium
                </div>

                <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
                  Une plateforme IPTV{" "}
                  <span className="text-green-400">élégante</span>, fluide et
                  moderne.
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
                  EvrardFoot te permet d’afficher tes chaînes dans une mosaïque
                  stylée, avec un lecteur intégré et une base prête pour la
                  version mobile Capacitor.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-4 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white">Aperçu</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {filteredChannels.slice(0, 4).map((channel) => (
                    <div
                      key={channel.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                    >
                      <img
                        src={channel.cover || "/logo.png"}
                        alt={channel.name}
                        className="h-24 w-full object-cover"
                      />
                      <div className="p-3">
                        <p className="truncate text-sm font-semibold text-white">
                          {channel.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {channel.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Chaînes disponibles</h3>
              <p className="text-sm text-zinc-400">
                Mosaïque paysage, jolie et moderne
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onSelect={setSelectedChannel}
                />
              ))}
            </div>
          </section>
        </main>
      </div>

      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={() => setSelectedChannel(null)}
        />
      )}
    </div>
  );
}