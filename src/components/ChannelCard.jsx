export default function ChannelCard({ channel, onSelect }) {
  return (
    <button
      onClick={() => onSelect(channel)}
      className="group relative w-full h-[190px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 text-left transition duration-300 hover:-translate-y-1 hover:border-green-500/50"
    >
      {/* IMAGE */}
      <img
        src={channel.cover || "/logo.png"}
        alt={channel.name}
        className="absolute inset-0 m-auto max-h-[60%] max-w-[60%] object-contain"
      />

      {/* OVERLAY PRO */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* CONTENU */}
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300 border border-green-500/30 backdrop-blur-sm">
            {channel.status}
          </span>

          <div className="rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
            LIVE
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/80">
            {channel.category}
          </p>
          <h3 className="mt-1 text-lg font-bold text-white drop-shadow-lg">
            {channel.name}
          </h3>
        </div>
      </div>
    </button>
  );
}
