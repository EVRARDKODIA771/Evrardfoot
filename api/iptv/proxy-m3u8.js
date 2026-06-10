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

    const m3u8Url =
      `${base}/live/${IPTV_USERNAME.trim()}` +
      `/${IPTV_PASSWORD.trim()}` +
      `/${String(stream_id).trim()}.m3u8`;

    const response = await fetch(m3u8Url);

    if (!response.ok) {
      return res.status(response.status).send("Playlist IPTV indisponible");
    }

    let text = await response.text();

    text = text.replace(
      /^(?!#)(.+)$/gm,
      (line) => {
        const cleanLine = line.trim();
        if (!cleanLine) return cleanLine;

        let absoluteUrl = cleanLine;

        if (!cleanLine.startsWith("http")) {
          absoluteUrl = new URL(cleanLine, m3u8Url).toString();
        }

        return `/api/iptv/proxy-segment?url=${encodeURIComponent(absoluteUrl)}`;
      }
    );

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(text);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
