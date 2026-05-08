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
      const url = new URL(rawUrl);

      // 🔥 BLOQUE CERTAINS DOMAINES CONNUS DE PUBS
      const blockedDomains = [
        "doubleclick.net",
        "adservice.google.com",
        "popads.net",
        "propellerads.com",
        "adsterra.com",
        "onclickmega.com",
      ];

      const blocked = blockedDomains.some((d) =>
        url.hostname.includes(d)
      );

      if (blocked) return "";

      return url.href;
    } catch {
      return "";
    }
  }, [channel, reader]);

  useEffect(() => {
    if (!channel) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", preventContextMenu);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", preventContextMenu);
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
    }, 7000);

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
    setIsLocked(false);
  };

  const openExternal = () => {
    if (!safeUrl) return;

    window.open(
      safeUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="flex h-screen w-screen flex-col bg-black text-white">

        {/* HEADER */}
        <div
          className={`border-b border-white/10 bg-black/80 transition duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex justify-between px-4 py-4">
            <div>
              <h2 className="text-lg font-semibold">
                {channel.name}
              </h2>

              <p className="text-sm text-zinc-400">
                {channel.category} — Lecteur {reader}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">

              {channel?.streamUrl2 && (
                <button
                  onClick={switchReader}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                >
                  {reader === 1
                    ? "Lecteur 2"
                    : "Lecteur 1"}
                </button>
              )}

              <button
                onClick={() => setForceFallback(true)}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 hidden md:block"
              >
                Mode externe
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>

        {/* PLAYER */}
        <div
          className="relative flex-1 bg-black"
          onMouseMove={() => setShowControls(true)}
        >
          <div className="absolute inset-0 p-2 md:p-4">

            <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black">

              {/* IFRAME */}
              {!forceFallback && !frameError && safeUrl && (
                <>
                  <iframe
                    key={safeUrl}
                    src={safeUrl}
                    title={channel.name}
                    className={`h-full w-full border-0 bg-black ${
                      isLocked
                        ? "pointer-events-auto"
                        : "pointer-events-none"
                    }`}
                    loading="eager"
                    allowFullScreen

                    // 🔥 IMPORTANT
                    sandbox="
                      allow-scripts
                      allow-same-origin
                      allow-forms
                      allow-presentation
                    "

                    // 🔥 PAS de allow-popups
                    // 🔥 PAS de allow-top-navigation

                    referrerPolicy="no-referrer"

                    allow="
                      autoplay;
                      encrypted-media;
                      fullscreen;
                      picture-in-picture
                    "

                    onLoad={() => {
                      setIsLoading(false);
                    }}

                    onError={() => {
                      setFrameError(true);
                      setIsLoading(false);
                    }}
                  />

                  {/* OVERLAY ANTI-PUB */}
                  {!isLocked && (
                    <div
                      className="absolute inset-0 z-20 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        setIsLocked(true);
                        setShowControls(true);
                      }}
                    />
                  )}
                </>
              )}

              {/* LOADING */}
              {isLoading &&
                !forceFallback &&
                !frameError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}

              {/* FALLBACK */}
              {(frameError ||
                forceFallback ||
                !safeUrl) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6 text-center">

                  <p className="text-lg font-semibold">
                    Lecture protégée bloquée
                  </p>

                  <p className="mt-2 text-sm text-zinc-400 max-w-md">
                    Ce lecteur tente probablement
                    d’ouvrir des pubs, popups ou
                    redirections interdites.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-3">

                    {channel?.streamUrl2 && (
                      <button
                        onClick={switchReader}
                        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
                      >
                        Essayer autre lecteur
                      </button>
                    )}

                    <button
                      onClick={openExternal}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
                    >
                      Ouvrir quand même
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
