import { useEffect, useMemo, useRef, useState } from "react";

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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default function VideoPlayer({ channel, onClose }) {
  const [reader, setReader] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [frameError, setFrameError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [tvCursor, setTvCursor] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });

  const playerRootRef = useRef(null);
  const cursorRef = useRef(tvCursor);

  const pressedRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    cursorRef.current = tvCursor;
  }, [tvCursor]);

  const safeUrl = useMemo(() => {
    const rawUrl =
      reader === 1
        ? channel?.streamUrl
        : channel?.streamUrl2 || channel?.streamUrl;

    if (!rawUrl) return "";

    try {
      const url = new URL(rawUrl);

      const blocked = BLOCKED_DOMAINS.some((domain) =>
        url.hostname.includes(domain)
      );

      if (blocked) return "";

      return url.href;
    } catch {
      return "";
    }
  }, [channel, reader]);

  const sandboxHtml = useMemo(() => {
    if (!safeUrl) return "";

    const escapedUrl = escapeHtml(safeUrl);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: 0;
      background: #000;
      display: block;
    }
  </style>
</head>

<body>
  <iframe
    src="${escapedUrl}"
    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
    allowfullscreen
    referrerpolicy="no-referrer"
  ></iframe>

  <script>
    window.open = function () {
      return null;
    };

    document.addEventListener("click", function (e) {
      var target = e.target;
      var link = target && target.closest ? target.closest("a") : null;

      if (link && link.target === "_blank") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);
  </script>
</body>
</html>`;
  }, [safeUrl]);

  useEffect(() => {
    if (!channel) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [channel]);

  useEffect(() => {
    setReader(1);
    setIsLoading(true);
    setFrameError(false);
    setShowControls(true);

    const center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    cursorRef.current = center;
    setTvCursor(center);
  }, [channel]);

  useEffect(() => {
    setIsLoading(true);
    setFrameError(false);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [safeUrl]);

  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [showControls]);

  useEffect(() => {
    if (!channel) return;

    const keepFocus = () => {
      playerRootRef.current?.focus({ preventScroll: true });
    };

    keepFocus();

    const interval = setInterval(keepFocus, 250);

    return () => clearInterval(interval);
  }, [channel]);

  const switchReader = () => {
    setReader((prev) => (prev === 1 ? 2 : 1));
    setIsLoading(true);
    setFrameError(false);
    setShowControls(true);

    playerRootRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!channel) return;

    let animationFrame;
    let lastTime = performance.now();

    const speed = 1200;

    const stopDirections = () => {
      pressedRef.current.up = false;
      pressedRef.current.down = false;
      pressedRef.current.left = false;
      pressedRef.current.right = false;
    };

    const handleKeyDown = (e) => {
      const key = e.key;

      const isBack =
        key === "Backspace" ||
        key === "Escape" ||
        key === "BrowserBack" ||
        key === "GoBack" ||
        e.keyCode === 4 ||
        e.keyCode === 461;

      const isOk =
        key === "Enter" ||
        key === "NumpadEnter" ||
        e.keyCode === 13 ||
        e.keyCode === 23 ||
        e.keyCode === 66;

      const isArrow =
        key === "ArrowUp" ||
        key === "ArrowDown" ||
        key === "ArrowLeft" ||
        key === "ArrowRight";

      if (!isBack && !isOk && !isArrow) return;

      setShowControls(true);

      if (isBack) {
        e.preventDefault();
        e.stopPropagation();
        stopDirections();
        onClose();
        return;
      }

      if (isOk) {
        e.preventDefault();
        e.stopPropagation();

        const { x, y } = cursorRef.current;
        const element = document.elementFromPoint(x, y);

        if (!element) return;

        const clickable = element.closest("button, a, [role='button']");

        if (clickable) {
          clickable.click();
        }

        playerRootRef.current?.focus({ preventScroll: true });
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (key === "ArrowUp") pressedRef.current.up = true;
      if (key === "ArrowDown") pressedRef.current.down = true;
      if (key === "ArrowLeft") pressedRef.current.left = true;
      if (key === "ArrowRight") pressedRef.current.right = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key;

      if (key === "ArrowUp") pressedRef.current.up = false;
      if (key === "ArrowDown") pressedRef.current.down = false;
      if (key === "ArrowLeft") pressedRef.current.left = false;
      if (key === "ArrowRight") pressedRef.current.right = false;
    };

    const animate = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const pressed = pressedRef.current;
      const current = cursorRef.current;

      let nextX = current.x;
      let nextY = current.y;

      const movement = speed * delta;

      if (pressed.up) nextY -= movement;
      if (pressed.down) nextY += movement;
      if (pressed.left) nextX -= movement;
      if (pressed.right) nextX += movement;

      nextX = Math.max(12, Math.min(window.innerWidth - 12, nextX));
      nextY = Math.max(12, Math.min(window.innerHeight - 12, nextY));

      const next = { x: nextX, y: nextY };

      cursorRef.current = next;
      setTvCursor(next);

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      stopDirections();
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      cancelAnimationFrame(animationFrame);
    };
  }, [channel, onClose]);

  if (!channel) return null;

  return (
    <div
      ref={playerRootRef}
      tabIndex={0}
      className="fixed inset-0 z-50 bg-black outline-none"
    >
      <div className="flex h-screen w-screen flex-col bg-black text-white">
        <div
          className={`border-b border-white/10 bg-black/90 transition duration-300 ${
            showControls ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex justify-between gap-3 px-4 py-4">
            <div>
              <h2 className="text-lg font-semibold">{channel.name}</h2>

              <p className="text-sm text-zinc-400">
                {channel.category} — Lecteur {reader}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {channel?.streamUrl2 && (
                <button
                  onClick={switchReader}
                  className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
                >
                  {reader === 1 ? "Lecteur 2" : "Lecteur 1"}
                </button>
              )}

              <button
                onClick={onClose}
                className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>

        <div
          className="relative flex-1 bg-black"
          onMouseMove={() => setShowControls(true)}
          onClick={() => {
            setShowControls(true);
            playerRootRef.current?.focus({ preventScroll: true });
          }}
        >
          <div className="absolute inset-0 p-2 md:p-4">
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              {!frameError && safeUrl && (
                <iframe
                  key={`${reader}-${safeUrl}`}
                  tabIndex={-1}
                  srcDoc={sandboxHtml}
                  title={channel.name}
                  className="h-full w-full border-0 bg-black"
                  style={{
                    pointerEvents: "none",
                  }}
                  loading="eager"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  onLoad={() => {
                    setIsLoading(false);
                    playerRootRef.current?.focus({ preventScroll: true });
                  }}
                  onError={() => {
                    setFrameError(true);
                    setIsLoading(false);
                  }}
                />
              )}

              {isLoading && !frameError && safeUrl && (
                <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/80">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}

              {(frameError || !safeUrl) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6 text-center">
                  <p className="text-lg font-semibold">Lecture indisponible</p>

                  <p className="mt-2 max-w-md text-sm text-zinc-400">
                    Ce lecteur est inaccessible ou bloqué.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    {channel?.streamUrl2 && (
                      <button
                        onClick={switchReader}
                        className="rounded-lg bg-zinc-800 px-4 py-2 hover:bg-zinc-700"
                      >
                        Essayer autre lecteur
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              position: "fixed",
              left: tvCursor.x,
              top: tvCursor.y,
              width: "24px",
              height: "24px",
              borderRadius: "999px",
              background: "white",
              border: "2px solid black",
              boxShadow: "0 0 24px rgba(255,255,255,0.95)",
              transform: "translate(-50%, -50%)",
              zIndex: 999999,
              pointerEvents: "none",
              transition: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
