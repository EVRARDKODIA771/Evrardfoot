import { useEffect, useMemo, useState } from "react";

export default function VideoPlayer({ channel, onClose }) {
  const [frameError, setFrameError] = useState(false);

  const safeUrl = useMemo(() => {
    if (!channel?.streamUrl) return "";
    try {
      const url = new URL(channel.streamUrl);
      return url.href;
    } catch {
      return "";
    }
  }, [channel]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-950 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-white">
              {channel.name}
            </h2>
            <p className="truncate text-sm text-zinc-400">
              {channel.category}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Fermer
          </button>
        </div>

        {!safeUrl ? (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-red-300">
            L’URL de cette chaîne est invalide ou absente.
          </div>
        ) : (
          <div className="relative flex-1 bg-black">
            <iframe
              title={channel.name}
              src={safeUrl}
              className="h-full w-full border-0 bg-black"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin"
              allow="autoplay; fullscreen; encrypted-media"
              loading="eager"
              allowFullScreen
              onError={() => setFrameError(true)}
            />

            {frameError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 px-6 text-center text-red-300">
                Impossible d’afficher cette page dans la vue intégrée.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}