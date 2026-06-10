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
      return res.status(400).json({
        error: true,
        message: "stream_id manquant",
      });
    }

    const base = IPTV_DNS.replace(/\/+$/, "");

    const streamUrl =
      `${base}/live/${encodeURIComponent(IPTV_USERNAME)}` +
      `/${encodeURIComponent(IPTV_PASSWORD)}` +
      `/${encodeURIComponent(stream_id)}.m3u8`;

    res.status(200).json({
      url: streamUrl,
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: err.message,
    });
  }
}
