import { useEffect, useMemo, useState } from "react";

export default function VideoPlayer({ channel, onClose }) {
  const [frameError, setFrameError] = useState(false);
  const [interactionUnlocked, setInteractionUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!channel) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [channel, onClose]);

  useEffect(() => {
    setInteractionUnlocked(false);
    setIsLoading(true);
    setFrameError(false);
  }, [channel]);

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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInteractionUnlocked((prev) => !prev)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                interactionUnlocked
                  ? "border border-green-500/30 bg-green-500/20 text-green-300 hover:bg-green-500/30"
                  : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {interactionUnlocked ? "Verrouiller" : "Déverrouiller"}
            </button>

            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/90 px-4 py-2 text-xs text-zinc-400">
          <span className="truncate">
            {interactionUnlocked
              ? "Interaction active."
              : "Interaction verrouillée : aucun clic direct n’est envoyé à la page tant que tu ne déverrouilles pas."}
          </span>
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
              className={`h-full w-full border-0 bg-black ${
                interactionUnlocked ? "pointer-events-auto" : "pointer-events-none"
              }`}
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="eager"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setFrameError(true);
                setIsLoading(false);
              }}
            />

            {!interactionUnlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                <div className="mx-4 max-w-lg rounded-2xl border border-white/10 bg-zinc-950/95 p-6 text-center shadow-2xl">
                  <h3 className="text-lg font-semibold text-white">
                    Lecture protégée
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    La zone vidéo reste verrouillée tant que tu n’actives pas
                    l’interaction. Cela évite la plupart des clics accidentels
                    sur des couches parasites.
                  </p>

                  <button
                    onClick={() => setInteractionUnlocked(true)}
                    className="mt-5 rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:scale-[1.02]"
                  >
                    Activer l’interaction
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
                <div className="rounded-2xl border border-white/10 bg-zinc-950/90 px-5 py-3 text-sm text-zinc-200">
                  Chargement…
                </div>
              </div>
            )}

            {frameError && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 px-6 text-center text-red-300">
                Impossible d’afficher cette chaîne dans la vue intégrée.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
