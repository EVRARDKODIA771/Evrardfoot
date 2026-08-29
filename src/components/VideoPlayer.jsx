import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

function getAndroidBridge() {
  if (typeof window === "undefined") {
    return null;
  }

  const bridge = window.androidBridge;

  return bridge &&
    typeof bridge.openExternalBrowser === "function"
    ? bridge
    : null;
}

export default function VideoPlayer({
  channel,
  onClose,
}) {
  const [reader, setReader] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [frameError, setFrameError] = useState(false);
  const [browserError, setBrowserError] = useState("");
  const [openAttempt, setOpenAttempt] = useState(0);

  const openedKeyRef = useRef("");
  const onCloseRef = useRef(onClose);

  const androidBridge = getAndroidBridge();
  const isAndroidApp = androidBridge !== null;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const safeUrl = useMemo(() => {
    const rawUrl =
      reader === 1
        ? channel?.streamUrl
        : channel?.streamUrl2 ||
          channel?.streamUrl;

    if (!rawUrl) {
      return "";
    }

    try {
      const url = new URL(rawUrl);

      const validProtocol =
        url.protocol === "https:" ||
        url.protocol === "http:";

      if (!validProtocol) {
        return "";
      }

      const blocked = BLOCKED_DOMAINS.some(
        (domain) =>
          url.hostname === domain ||
          url.hostname.endsWith(`.${domain}`)
      );

      if (blocked) {
        return "";
      }

      return url.href;
    } catch (error) {
      console.error(
        "Adresse du lecteur invalide :",
        error
      );

      return "";
    }
  }, [channel, reader]);

  useEffect(() => {
    if (!channel) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [channel]);

  useEffect(() => {
    setReader(1);
    setIsLoading(true);
    setFrameError(false);
    setBrowserError("");
    openedKeyRef.current = "";
  }, [channel]);

  /*
   * APPLICATION ANDROID :
   * transmet l'URL au pont Java de MainActivity.
   * Android ouvre ensuite le navigateur externe du téléphone.
   */
  useEffect(() => {
    if (!isAndroidApp || !safeUrl) {
      return undefined;
    }

    const openingKey =
      `${safeUrl}:${openAttempt}`;

    if (openedKeyRef.current === openingKey) {
      return undefined;
    }

    openedKeyRef.current = openingKey;

    const openNativeBrowser = () => {
      setIsLoading(true);
      setBrowserError("");

      try {
        const opened = androidBridge.openExternalBrowser(
          safeUrl
        );

        if (opened === false) {
          throw new Error(
            "Aucun navigateur Android compatible."
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error(
          "Erreur du navigateur Android :",
          error
        );

        openedKeyRef.current = "";

        setIsLoading(false);
        setBrowserError(
          "Le navigateur Android n’a pas pu être ouvert."
        );
      }
    };

    openNativeBrowser();
  }, [
    isAndroidApp,
    androidBridge,
    safeUrl,
    openAttempt,
  ]);

  /*
   * NAVIGATEUR WEB NORMAL :
   * chargement classique de l’iframe.
   */
  useEffect(() => {
    if (isAndroidApp) {
      return undefined;
    }

    setIsLoading(true);
    setFrameError(false);

    if (!safeUrl) {
      setIsLoading(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 10000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [safeUrl, isAndroidApp]);

  useEffect(() => {
    if (!channel) {
      return undefined;
    }

    const handleBack = (event) => {
      const isBack =
        event.key === "Escape" ||
        event.key === "Backspace" ||
        event.key === "BrowserBack" ||
        event.key === "GoBack" ||
        event.keyCode === 4 ||
        event.keyCode === 461;

      if (!isBack) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      onCloseRef.current();
    };

    window.addEventListener(
      "keydown",
      handleBack,
      true
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleBack,
        true
      );
    };
  }, [channel]);

  const switchReader = () => {
    openedKeyRef.current = "";

    setReader((currentReader) =>
      currentReader === 1 ? 2 : 1
    );

    setIsLoading(true);
    setFrameError(false);
    setBrowserError("");
  };

  const retryNativeBrowser = () => {
    openedKeyRef.current = "";
    setBrowserError("");
    setOpenAttempt((current) => current + 1);
  };

  if (!channel) {
    return null;
  }

  /*
   * APPLICATION ANDROID :
   * cet écran reste derrière le navigateur externe.
   */
  if (isAndroidApp) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-6 text-white">
        <div className="w-full max-w-md text-center">
          {isLoading && (
            <>
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-white border-t-transparent" />

              <p className="mt-4 text-sm text-zinc-400">
                Ouverture du lecteur…
              </p>
            </>
          )}

          {!isLoading && !browserError && (
            <>
              <p className="text-lg font-semibold">
                Lecteur ouvert
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                La vidéo a été ouverte dans le
                navigateur Android.
              </p>

              <button
                type="button"
                onClick={retryNativeBrowser}
                className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-500"
              >
                Rouvrir le lecteur
              </button>
            </>
          )}

          {browserError && (
            <>
              <p className="text-lg font-semibold text-red-400">
                Ouverture impossible
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                {browserError}
              </p>

              <button
                type="button"
                onClick={retryNativeBrowser}
                className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-500"
              >
                Réessayer
              </button>
            </>
          )}

          {!safeUrl && (
            <p className="text-sm text-red-400">
              L’adresse de ce lecteur est invalide.
            </p>
          )}

          {channel?.streamUrl2 && (
            <button
              type="button"
              onClick={switchReader}
              className="mt-3 rounded-xl bg-zinc-800 px-6 py-3 text-sm font-semibold hover:bg-zinc-700"
            >
              Essayer le lecteur{" "}
              {reader === 1 ? "2" : "1"}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-3 rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/5"
          >
            Retour aux chaînes
          </button>
        </div>
      </div>
    );
  }

  /*
   * VERSION WEB :
   * lecture dans l’iframe.
   */
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

            {isLoading &&
              !frameError &&
              safeUrl && (
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
                  Ce lecteur est inaccessible ou
                  temporairement bloqué.
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
          </div>
        </main>
      </div>
    </div>
  );
}
