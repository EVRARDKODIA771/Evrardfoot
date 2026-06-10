import express from "express";

const router = express.Router();

const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

function assertConfig() {
  if (!IPTV_DNS || !IPTV_USERNAME || !IPTV_PASSWORD) {
    throw new Error("Configuration IPTV manquante dans le fichier .env");
  }
}

function getXtreamUrl(path) {
  assertConfig();

  const cleanDns = IPTV_DNS.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${cleanDns}/${cleanPath}`;
}

router.get("/channels", async (req, res) => {
  try {
    const url = getXtreamUrl(
      `player_api.php?username=${encodeURIComponent(
        IPTV_USERNAME
      )}&password=${encodeURIComponent(
        IPTV_PASSWORD
      )}&action=get_live_streams`
    );

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        error: "Le serveur IPTV n'a pas répondu correctement.",
      });
    }

    const data = await response.json();

    const channels = Array.isArray(data)
      ? data.map((channel) => ({
          stream_id: channel.stream_id,
          name: channel.name,
          category_id: channel.category_id,
          category_name: channel.category_name || "Live TV",
          stream_icon: channel.stream_icon,
          epg_channel_id: channel.epg_channel_id,
          added: channel.added,
        }))
      : [];

    res.json(channels);
  } catch (err) {
    res.status(500).json({
      error: err.message || "Erreur serveur IPTV.",
    });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const url = getXtreamUrl(
      `player_api.php?username=${encodeURIComponent(
        IPTV_USERNAME
      )}&password=${encodeURIComponent(
        IPTV_PASSWORD
      )}&action=get_live_categories`
    );

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        error: "Impossible de charger les catégories IPTV.",
      });
    }

    const data = await response.json();
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    res.status(500).json({
      error: err.message || "Erreur serveur IPTV.",
    });
  }
});

router.get("/stream/:streamId.m3u8", async (req, res) => {
  try {
    const { streamId } = req.params;

    if (!streamId || !/^\d+$/.test(streamId)) {
      return res.status(400).json({
        error: "streamId invalide.",
      });
    }

    const upstreamUrl = getXtreamUrl(
      `live/${encodeURIComponent(IPTV_USERNAME)}/${encodeURIComponent(
        IPTV_PASSWORD
      )}/${streamId}.m3u8`
    );

    const response = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "EvrardFoot/1.0",
      },
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Flux IPTV indisponible.",
      });
    }

    const contentType = response.headers.get("content-type") || "";

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    if (contentType.includes("mpegurl") || contentType.includes("m3u8")) {
      let playlist = await response.text();

      const baseUrl = getXtreamUrl(
        `live/${encodeURIComponent(IPTV_USERNAME)}/${encodeURIComponent(
          IPTV_PASSWORD
        )}/`
      );

      playlist = playlist.replace(
        /^(?!#)(.+)$/gm,
        (line) => {
          const trimmed = line.trim();

          if (!trimmed) return trimmed;

          if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return `/api/iptv/proxy?url=${encodeURIComponent(trimmed)}`;
          }

          const absoluteSegmentUrl = `${baseUrl}${trimmed}`;
          return `/api/iptv/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
        }
      );

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.send(playlist);
    }

    res.setHeader("Content-Type", contentType || "video/mp2t");

    if (!response.body) {
      return res.status(502).json({
        error: "Flux vide.",
      });
    }

    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({
      error: err.message || "Erreur de lecture du flux.",
    });
  }
});

router.get("/proxy", async (req, res) => {
  try {
    const rawUrl = req.query.url;

    if (!rawUrl) {
      return res.status(400).json({
        error: "URL manquante.",
      });
    }

    const decodedUrl = decodeURIComponent(rawUrl);

    if (!decodedUrl.startsWith(IPTV_DNS)) {
      return res.status(403).json({
        error: "URL proxy refusée.",
      });
    }

    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "EvrardFoot/1.0",
      },
    });

    if (!response.ok) {
      return res.status(502).end();
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "video/mp2t"
    );

    if (!response.body) {
      return res.status(502).end();
    }

    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({
      error: err.message || "Erreur proxy IPTV.",
    });
  }
});

export default router;
