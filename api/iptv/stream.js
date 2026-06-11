const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

function assertConfig() {
  if (!IPTV_DNS || !IPTV_USERNAME || !IPTV_PASSWORD) {
    throw new Error("Variables IPTV manquantes");
  }
}

export default async function handler(req, res) {
  try {
    assertConfig();

    const { stream_id } = req.query;

    if (!stream_id) {
      return res.status(400).send("stream_id manquant");
    }

    const base = IPTV_DNS.trim().replace(/\/+$/, "");

    const iptvUrl =
      `${base}/live/${IPTV_USERNAME.trim()}` +
      `/${IPTV_PASSWORD.trim()}` +
      `/${stream_id}.m3u8`;

    const response = await fetch(iptvUrl);

    if (!response.ok) {
      return res.status(response.status).send("Flux indisponible");
    }

    let playlist = await response.text();

    playlist = playlist.replace(
      /^\/hlsr\/(.+)$/gm,
      (_, p) =>
        `/api/iptv/segment?path=${encodeURIComponent(
          `/hlsr/${p}`
        )}`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.apple.mpegurl"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    return res.status(200).send(playlist);

  } catch (err) {
    return res.status(500).send(err.message);
  }
}
