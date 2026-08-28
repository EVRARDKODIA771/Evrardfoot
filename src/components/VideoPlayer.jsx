import { useEffect, useMemo, useState } from "react";

const BLOCKED_DOMAINS = [
  "doubleclick.net",
  "adservice.google.com",
  "googlesyndication.com",
  "google-analytics.com",
  "popads.net",
  "popcash.net",
  "propellerads.com",
  "adsterra.com",
  "onclickmega.com",
  "taboola.com",
  "outbrain.com",
];

function isCapacitorNative() {
  if (typeof window === "undefined") return false;

  const capacitor = window.Capacitor;

  if (!capacitor) return false;

  if (typeof capacitor.isNativePlatform === "function") {
    return capacitor.isNativePlatform();
  }

  if (typeof capacitor.getPlatform === "function") {
    return capacitor.getPlatform() !== "web";
  }

  return Boolean(capacitor.isNative);
}

export default function VideoPlayer({ channel, onClose }) {
  const [reader, setReader] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [frameError, setFrameError] = useState(false);
  const [openingBrowser, setOpeningBrowser] = useState(false);
  const [browserError, setBrowserError] = useState("");
  const [isNativeApp, setIsNativeApp] = useState(false);

  const safeUrl = useMemo(() => {
    const rawUrl =
      reader === 1
        ? channel?.streamUrl
        : channel?.streamUrl2 || channel?.streamUrl;

    if (!rawUrl) return "";

    try {
      const url = new URL(rawUrl);

      const blocked = BLOCKED_DOMAINS.some(
        (domain) =>
          url.hostname === domain ||
          url.hostname.endsWith(`.${domain}`)
      );

      if (blocked) return "";

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }, [channel, reader]);

  useEffect(() => {
    setIsNativeApp(isCapacitorNative());
  }, []);

  useEffect(() => {
    if (!channel) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [channel]);

  useEffect(() => {
    setReader(1);
    setIsLoading(true);
    setFrameError(false);
    setOpeningBrowser(false);
    setBrowserError("");
  }, [channel]);

  useEffect(() => {
    setIsLoading(true);
    setFrameError(false);
    setBrowserError("");

    if (!safeUrl || isNativeApp) {
      setIsLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [safeUrl, isNativeApp]);

  useEffect(() => {
    if (!channel) return undefined;

    const handleBack = (event) => {
      const isBack =
        event.key === "Escape" ||
        event.key === "Backspace" ||
        event.key === "BrowserBack" ||
        event.key === "GoBack" ||
        event.keyCode === 4 ||
        event.keyCode === 461;

      if (!isBack) return;

      event.preventDefault();
      onClose();
    };

    window.addEventListener("keydown", handleBack, true);

    return () => {
      window.removeEventListener("keydown", handleBack, true);
    };
  }, [channel, onClose]);

  const switchReader = () => {
    setReader((currentReader) =>
      currentReader === 1 ? 2 : 1
    );

    setIsLoading(true);
    setFrameError(false);
    setBrowserError("");
  };

  const openNativePlayer = async () => {
    if (!safeUrl || openingBrowser) return;

    setOpeningBrowser(true);
    setBrowserError("");

    try {
      const browserPlugin =
        window.Capacitor?.Plugins?.Browser;

      if (browserPlugin?.open) {
        await browserPlugin.open({
          url: safeUrl,
          presentationStyle: "fullscreen",
          toolbarColor: "#000000",
        });

        return;
      }

      const openedWindow = window.open(
        safeUrl,
        "_blank",
        "noopener,noreferrer"
      );

      if (!openedWindow) {
        window.location.href = safeUrl;
      }
    } catch (error) {
      console.error(
        "Impossible d’ouvrir le lecteur externe :",
        error
      );

      setBrowserError(
        "Le lecteur n’a pas pu être ouvert. Réessaie ou utilise l’autre lecteur."
      );
    } finally {
      setOpeningBrowser(false);
    }
  };

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <div className="flex h-screen w-screen flex-col bg-black">
        <header className="border-b border-white/10 bg-black/95">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">
                {channel.name}
              </h2>

              <p className="text-sm text-zinc-400">
                {channel.category} — Lecteur {reader}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {channel?.streamUrl2 && (
                <button
                  type="button"
                  onClick={switchReader}
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700"
                >
                  {reader === 1
                    ? "Lecteur 2"
                    : "Lecteur 1"}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </header>

        <main className="relative flex-1 bg-black p-2 md:p-4">
          <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black">
            {isNativeApp ? (
              <div className="flex h-full w-full flex-col items-center justify-center bg-black p-6 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-3xl">
                  ▶
                </div>

                <h3 className="text-xl font-bold">
                  {channel.name}
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                  Le lecteur va s’ouvrir dans une fenêtre vidéo
                  compatible. Le bouton Retour te ramènera dans
                  EvrardFoot.
                </p>

                {browserError && (
                  <p className="mt-4 max-w-md rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {browserError}
                  </p>
                )}

                {!safeUrl ? (
                  <p className="mt-5 text-sm text-red-400">
                    L’adresse de ce lecteur est invalide.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={openNativePlayer}
                    disabled={openingBrowser}
                    className="mt-6 rounded-xl bg-red-600 px-7 py-3 font-bold text-white transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-60"
                  >
                    {openingBrowser
                      ? "Ouverture…"
                      : "Regarder maintenant"}
                  </button>
                )}

                {channel?.streamUrl2 && (
                  <button
                    type="button"
                    onClick={switchReader}
                    className="mt-3 rounded-xl bg-zinc-800 px-6 py-3 text-sm font-semibold hover:bg-zinc-700"
                  >
                    Essayer le lecteur {reader === 1 ? "2" : "1"}
                  </button>
                )}
              </div>
            ) : (
              <>
                {!frameError && safeUrl && (
                  <iframe
                    key={`${reader}-${safeUrl}`}
                    src={safeUrl}
                    title={`${channel.name} — Lecteur ${reader}`}
                    className="h-full w-full border-0 bg-black"
                    loading="eager"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    onLoad={() => {
                      setIsLoading(false);
                    }}
                    onError={() => {
                      setFrameError(true);
                      setIsLoading(false);
                    }}
                  />
                )}

                {isLoading && !frameError && safeUrl && (
                  <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    <p className="mt-4 text-sm text-zinc-400">
                      Chargement du lecteur…
                    </p>
                  </div>
                )}

                {(frameError || !safeUrl) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6 text-center">
                    <p className="text-lg font-semibold">
                      Lecture indisponible
                    </p>

                    <p className="mt-2 max-w-md text-sm text-zinc-400">
                      Ce lecteur est inaccessible ou temporairement bloqué.
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      {channel?.streamUrl2 && (
                        <button
                          type="button"
                          onClick={switchReader}
                          className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
                        >
                          Essayer l’autre lecteur
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
