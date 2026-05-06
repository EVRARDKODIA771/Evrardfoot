import { useEffect, useMemo, useState } from "react";

export default function VideoPlayer({ channel, onClose }) {
  const [frameError, setFrameError] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reader, setReader] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [forceFallback, setForceFallback] = useState(false);

  const safeUrl = useMemo(() => {
    const rawUrl =
      reader === 1
        ? channel?.streamUrl
        : channel?.streamUrl2 || channel?.streamUrl;

    if (!rawUrl) return "";

    try {
      return new URL(rawUrl).href;
    } catch {
      return "";
    }
  }, [channel, reader]);

  useEffect(() => {
    if (!channel) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
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
    setForceFallback(false);
    setReader(1);
    setShowControls(true);
  }, [channel]);

  useEffect(() => {
    setIsLoading(true);
    setFrameError(false);
    setForceFallback(false);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, [safeUrl]);

  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [showControls]);

  if (!channel) return null;

  const switchReader = () => {
    setReader((prev) => (prev === 1 ? 2 : 1));
    setIsLoading(true);
    setFrameError(false);
    setForceFallback(false);
    setShowControls(true);
  };

  const openExternal = () => {
    if (!safeUrl) return;
    window.open(safeUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="flex h-screen w-screen flex-col bg-[#050505] text-white">
        
        {/* HEADER */}
        <div
          className={`border-b border-white/10 bg-black/60 transition ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex justify-between px-4 py-4">
            <div>
              <h2 className="text-lg font-semibold">{channel.name}</h2>
              <p className="text-sm text-zinc-400">
                {channel.category} — Lecteur {reader}
              </p>
            </div>

            <div className="flex gap-2">
              {channel?.streamUrl2 && (
                <button onClick={switchReader} className="btn">
                  {reader === 1 ? "Lecteur 2" : "Lecteur 1"}
                </button>
              )}

              <button
                onClick={() => setForceFallback(true)}
                className="btn hidden md:block"
              >
                Mode externe
              </button>

              <button onClick={onClose} className="btn">
                Fermer
              </button>
            </div>
          </div>
        </div>

        {/* PLAYER */}
        <div className="relative flex-1 bg-black">
          <div className="absolute inset-0 flex items-center justify-center p-4">

            <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10">

              {/* IFRAME */}
              {!forceFallback && !frameError && (
                <iframe
                  key={safeUrl}
                  src={safeUrl}
                  title={channel.name}
                  className="h-full w-full border-0"
                  
                  // 🔥 CHANGEMENT IMPORTANT
                  referrerPolicy="origin"

                  // 🔥 MAX PERMISSIF
                  allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; clipboard-read *; clipboard-write *; web-share *"
                  
                  allowFullScreen
                  loading="eager"

                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setFrameError(true);
                    setIsLoading(false);
                  }}
                />
              )}

              {/* LOADER */}
              {isLoading && !forceFallback && !frameError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="animate-spin h-10 w-10 border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}

              {/* FALLBACK */}
              {(frameError || forceFallback) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-center p-6">
                  <p className="text-lg font-semibold">
                    Lecture iframe bloquée
                  </p>

                  <p className="text-sm text-zinc-400 mt-2">
                    Ce site refuse l’intégration iframe sur ton domaine.
                  </p>

                  <div className="mt-4 flex gap-3 flex-wrap justify-center">
                    {channel?.streamUrl2 && (
                      <button onClick={switchReader} className="btn">
                        Essayer autre lecteur
                      </button>
                    )}

                    <button onClick={openExternal} className="btn-primary">
                      Ouvrir dans navigateur
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
