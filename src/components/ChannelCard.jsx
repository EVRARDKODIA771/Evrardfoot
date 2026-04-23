export default function ChannelCard({ channel, onSelect }) {
  return (
    <button
      onClick={() => onSelect(channel)}
      className="group relative h-[210px] w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#0b0b0b] text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:bg-[#101010] hover:shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
    >
      {/* fond léger */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)] opacity-70" />

      {/* image */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <img
          src={channel.cover || "/logo.png"}
          alt={channel.name}
          className="max-h-[58%] max-w-[58%] object-contain opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
      </div>

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

      {/* contenu */}
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-200 backdrop-blur-sm">
            {channel.status || "Disponible"}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-zinc-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            LIVE
          </span>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-400">
            {channel.category}
          </p>
          <h3 className="mt-2 line-clamp-2 text-xl font-bold tracking-tight text-white">
            {channel.name}
          </h3>
        </div>
      </div>

      {/* contour lumineux subtil */}
      <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/0 transition duration-300 group-hover:ring-white/10" />
    </button>
  );
}
