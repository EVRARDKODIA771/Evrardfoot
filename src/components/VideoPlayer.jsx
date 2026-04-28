import { useEffect, useMemo, useState } from "react";

export default function VideoPlayer({ channel, onClose }) {
  const [frameError, setFrameError] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reader, setReader] = useState(1);

  const safeUrl = useMemo(() => {
    const rawUrl =
      reader === 1
        ? channel?.streamUrl2 || channel?.streamUrl
        : channel?.streamUrl;

    if (!rawUrl) return "";

    try {
      const url = new URL(rawUrl);
      return url.href;
    } catch {
      return "";
    }
  }, [channel, reader]);

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
    setIsLocked(false);
    setIsLoading(true);
    setFrameError(false);
    setReader(1);
  }, [channel]);

  useEffect(() => {
    setIsLoading(true);
    setFrameError(false);
  }, [safeUrl]);

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#050505] text-white">
        {/* HEADER */}
        <div className="border-b border-white/10 bg-black/60 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="min-w-0">
              <p className="mb-1 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                Lecture en cours
              </p>
              <h2 className="truncate text-lg font-semibold tracking-tight text-white md:text-xl">
                {channel.name}
              </h2>
              <p className="truncate text-sm text-zinc-400">
                {channel.category} — Lecteur {reader}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {channel?.streamUrl2 && (
                <button
                  onClick={() => setReader((prev) => (prev === 1 ? 2 : 1))}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                >
                  {reader === 1 ? "Lecteur 2" : "Lecteur 1"}
                </button>
              )}

              <button
                onClick={() => setIsLocked((prev) => !prev)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  isLocked
                    ? "border-white/20 bg-white/12 text-white hover:bg-white/18"
                    : "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
                }`}
              >
                {isLocked ? "Déverrouiller" : "Verrouiller"}
              </button>

              <button
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>

        {/* BANDEAU VPN */}
        <div className="mx-4 mt-3 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-center text-sm text-yellow-100">
          Si la vidéo ne fonctionne pas ou affiche <b>“stream offline”</b>,
          utilisez NordVPN avec une localisation en France, puis rechargez le
          lecteur.
        </div>

        {!safeUrl ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="max-w-md rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-5 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <p className="text-base font-semibold text-white">URL invalide</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                L’adresse du flux est absente ou mal formée pour cette chaîne.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative flex-1 bg-black">
            {/* PLAYER CENTRÉ */}
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
              <div className="relative h-[85%] w-[95%] md:h-[80%] md:w-[85%] overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                <iframe
                  key={safeUrl}
                  title={channel.name}
                  src={safeUrl}
                  className={`h-full w-full border-0 bg-black ${
                    isLocked ? "pointer-events-none" : "pointer-events-auto"
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

                {isLocked && (
                  <div className="absolute inset-0 z-10 bg-transparent" />
                )}

                {isLoading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-sm">
                    <div className="rounded-2xl border border-white/10 bg-zinc-950/90 px-5 py-4 text-sm text-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                      Chargement du lecteur…
                    </div>
                  </div>
                )}

                {frameError && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 px-6">
                    <div className="max-w-md rounded-[24px] border border-white/10 bg-white/[0.04] px-6 py-5 text-center shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                      <p className="text-base font-semibold text-white">
                        Lecture intégrée impossible
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Cette chaîne refuse probablement l’affichage dans une
                        iframe ou bloque l’intégration externe.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BADGE */}
            <div className="pointer-events-none absolute bottom-6 left-6 z-20 hidden rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs uppercase tracking-[0.25em] text-zinc-300 backdrop-blur-md md:block">
              EvrardFoot Player
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
