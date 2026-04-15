const { app, BrowserWindow, session, shell } = require("electron");
const path = require("path");

const APP_URL = "https://evrardfoot.vercel.app";

const ALLOWED_HOSTS = new Set([
  "evrardfoot.vercel.app",
  "bolaloca.my",
]);

const BLOCKED_KEYWORDS = [
  "doubleclick",
  "googlesyndication",
  "adservice",
  "adnxs",
  "popads",
  "propellerads",
  "taboola",
  "outbrain",
  "exoclick",
  "trafficjunky",
  "adskeeper",
  "hilltopads",
  "onclick",
  "popunder",
  "adroll",
  "mgid",
  "sex",
  "porn",
  "xxx",
  "adult",
];

function isAllowedUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (!["http:", "https:"].includes(url.protocol)) return false;
    if (ALLOWED_HOSTS.has(host)) return true;

    for (const allowed of ALLOWED_HOSTS) {
      if (host.endsWith(`.${allowed}`)) return true;
    }

    return false;
  } catch {
    return false;
  }
}

function isBlockedByKeyword(rawUrl) {
  const value = rawUrl.toLowerCase();
  return BLOCKED_KEYWORDS.some((k) => value.includes(k));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      devTools: true, // passe à false pour les démos si tu veux
    },
  });

  // Bloque toute tentative d'ouverture de nouvelle fenêtre / popup
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedUrl(url) && !isBlockedByKeyword(url)) {
      return { action: "deny" };
    }
    return { action: "deny" };
  });

  // Bloque les navigations hors liste blanche
  win.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedUrl(url) || isBlockedByKeyword(url)) {
      event.preventDefault();
    }
  });

  // Intercepte et bloque certaines requêtes pub / domaines douteux
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url || "";

    if (isBlockedByKeyword(url)) {
      return callback({ cancel: true });
    }

    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();

      // Autorise ton app, le player utile, et quelques ressources de base
      const allowed =
        ALLOWED_HOSTS.has(host) ||
        [...ALLOWED_HOSTS].some((d) => host.endsWith(`.${d}`)) ||
        details.resourceType === "image" ||
        details.resourceType === "media" ||
        details.resourceType === "script" ||
        details.resourceType === "stylesheet" ||
        details.resourceType === "xhr" ||
        details.resourceType === "fetch";

      if (!allowed) {
        return callback({ cancel: true });
      }

      return callback({ cancel: false });
    } catch {
      return callback({ cancel: true });
    }
  });

  // Empêche l'ouverture externe automatique
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  // Si un lien externe passe malgré tout, on ne l'ouvre pas
  win.webContents.on("new-window", (event) => {
    event.preventDefault();
  });

  win.loadURL(APP_URL);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
