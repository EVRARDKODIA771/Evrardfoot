import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

export default function Extended({ onRestrict }) {
  const videoRef = useRef(null);

  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadChannels() {
      try {
        setLoading(true);
        const res = await fetch("/api/iptv/channels");

        if (!res.ok) {
          throw new Error("Impossible de charger les chaînes IPTV.");
        }

        const data = await res.json();
        setChannels(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    }

    loadChannels();
  }, []);

  useEffect(() => {
    if (!selectedChannel || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = `/api/iptv/stream/${selectedChannel.stream_id}.m3u8`;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.play().catch(() => {});

    return () => {
      if (hls) hls.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [selectedChannel]);

  const categories = useMemo(() => {
    const list = channels
      .map((c) => c.category_name || c.category || "Autres")
      .filter(Boolean);

    return ["Tous", ...Array.from(new Set(list))];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    const q = search.toLowerCase().trim();

    return channels.filter((channel) => {
      const name = String(channel.name || "").toLowerCase();
      const cat = channel.category_name || channel.category || "Autres";

      const matchSearch = name.includes(q);
      const matchCategory = category === "Tous" || cat === category;

      return matchSearch && matchCategory;
    });
  }, [channels, search, category]);

  const heroChannel = selectedChannel || filteredChannels[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              EvrardFoot Extended
            </h1>
            <p className="text-sm text-zinc-400">
              Version étendue • Live TV • Premium
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une chaîne..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-red-500 md:w-[320px]"
            />

            <button
              onClick={onRestrict}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
            >
              Restreindre
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[78vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroChannel?.stream_icon || "/bg.jpeg"}
              alt=""
              className="h-full w-full object-cover opacity-30 blur-sm"
            />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_1.4fr] md:px-8">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit rounded-full border border-red-500/30 bg-red-600/20 px-4 py-2 text-sm font-bold text-red-200">
                LIVE MAINTENANT
              </div>

              <h2 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
                {heroChannel?.name || "EvrardFoot Live"}
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300">
                Choisis une chaîne et lance le direct dans une interface
                immersive inspirée des plateformes premium.
              </p>

              {heroChannel && (
                <button
                  onClick={() => setSelectedChannel(heroChannel)}
                  className="mt-8 w-fit rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-[0_0_40px_rgba(220,38,38,0.35)] transition hover:bg-red-500"
                >
                  ▶ Regarder maintenant
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-2xl">
              {selectedChannel ? (
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  playsInline
                  className="aspect-video w-full bg-black"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-black">
                  <div className="text-center">
                    <p className="text-xl font-black">Aucune chaîne lancée</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Sélectionne une chaîne pour commencer.
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 p-4">
                <p className="text-sm font-bold">
                  {selectedChannel?.name || "Lecteur EvrardFoot Extended"}
                </p>
                <p className="text-xs text-zinc-500">
                  {selectedChannel
                    ? selectedChannel.category_name || "Live"
                    : "En attente de lecture"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition ${
                  category === cat
                    ? "bg-white text-black"
                    : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.12]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black">Chaînes disponibles</h3>
              <p className="text-sm text-zinc-500">
                {filteredChannels.length} résultat
                {filteredChannels.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-[190px] animate-pulse rounded-[24px] bg-white/[0.06]"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.stream_id}
                  onClick={() => setSelectedChannel(channel)}
                  className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] text-left transition hover:scale-[1.03] hover:bg-white/[0.08]"
                >
                  <div className="flex h-32 items-center justify-center bg-black p-5">
                    <img
                      src={channel.stream_icon || "/bg.jpeg"}
                      alt={channel.name}
                      className="max-h-full max-w-full object-contain transition group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/bg.jpeg";
                      }}
                    />
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-1 text-sm font-black">
                      {channel.name}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                      {channel.category_name || "Live TV"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
