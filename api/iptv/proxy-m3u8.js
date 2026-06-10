const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

function assertConfig() {
  if (!IPTV_DNS || !IPTV_USERNAME || !IPTV_PASSWORD) {
    throw new Error("Variables IPTV manquantes sur Vercel");
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
    const username = IPTV_USERNAME.trim();
    const password = IPTV_PASSWORD.trim();

    const m3u8Url = `${base}/live/${username}/${password}/${String(
      stream_id
    ).trim()}.m3u8`;

    const response = await fetch(m3u8Url, {
      headers: {
        "User-Agent": "VLC/3.0.20 LibVLC/3.0.20",
        Accept: "*/*",
        Connection: "keep-alive",
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .send(`Playlist IPTV indisponible: ${response.status}`);
    }

    let text = await response.text();

    text = text.replace(/^(?!#)(.+)$/gm, (line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return cleanLine;

      let absoluteUrl = cleanLine;

      if (!cleanLine.startsWith("http")) {
        absoluteUrl = new URL(cleanLine, m3u8Url).toString();
      }

      return `/api/iptv/proxy-segment?url=${encodeURIComponent(absoluteUrl)}`;
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).send(text);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
