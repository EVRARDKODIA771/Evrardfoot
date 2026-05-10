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

export default function VideoPlayer({ channel, onClose }) {
  const [reader, setReader] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [frameError, setFrameError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [tvMouse, setTvMouse] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });

  const tvMouseRef = useRef(tvMouse);

  useEffect(() => {
    tvMouseRef.current = tvMouse;
  }, [tvMouse]);

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

    tvMouseRef.current = center;
    setTvMouse(center);
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

  const switchReader = () => {
    setReader((prev) => (prev === 1 ? 2 : 1));
    setIsLoading(true);
    setFrameError(false);
    setShowControls(true);
  };

  useEffect(() => {
    if (!channel) return;

    const pressed = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    const speed = 1000;
    let animationFrame;
    let lastTime = performance.now();

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

      e.preventDefault();
      e.stopPropagation();

      setShowControls(true);

      if (isBack) {
        onClose();
        return;
      }

      if (isOk) {
        const { x, y } = tvMouseRef.current;
        const element = document.elementFromPoint(x, y);

        if (!element) return;

        const clickable = element.closest("button, a, [role='button']");

        if (clickable) {
          clickable.click();
          return;
        }

        if (element.tagName === "IFRAME") {
          element.focus();
        }

        return;
      }

      if (key === "ArrowUp") pressed.up = true;
      if (key === "ArrowDown") pressed.down = true;
      if (key === "ArrowLeft") pressed.left = true;
      if (key === "ArrowRight") pressed.right = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key;

      if (key === "ArrowUp") pressed.up = false;
      if (key === "ArrowDown") pressed.down = false;
      if (key === "ArrowLeft") pressed.left = false;
      if (key === "ArrowRight") pressed.right = false;
    };

    const animate = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const current = tvMouseRef.current;

      let nextX = current.x;
      let nextY = current.y;

      const movement = speed * delta;

      if (pressed.up) nextY -= movement;
      if (pressed.down) nextY += movement;
      if (pressed.left) nextX -= movement;
      if (pressed.right) nextX += movement;

      nextX = Math.max(10, Math.min(window.innerWidth - 10, nextX));
      nextY = Math.max(10, Math.min(window.innerHeight - 10, nextY));

      const next = {
        x: nextX,
        y: nextY,
      };

      tvMouseRef.current = next;
      setTvMouse(next);

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      cancelAnimationFrame(animationFrame);
    };
  }, [channel, onClose]);

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="flex h-screen w-screen flex-col bg-black text-white">
        <div
          className={`border-b border-white/10 bg-black/90 transition duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
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
          onClick={() => setShowControls(true)}
        >
          <div className="absolute inset-0 p-2 md:p-4">
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              {!frameError && safeUrl && (
                <iframe
                  key={safeUrl}
                  src={safeUrl}
                  title={channel.name}
                  className="h-full w-full border-0 bg-black"
                  loading="eager"
                  allowFullScreen
                  referrerPolicy="no-referrer"
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
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
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
              left: tvMouse.x,
              top: tvMouse.y,
              width: "22px",
              height: "22px",
              borderRadius: "999px",
              background: "white",
              border: "2px solid black",
              boxShadow: "0 0 25px rgba(255,255,255,0.95)",
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
