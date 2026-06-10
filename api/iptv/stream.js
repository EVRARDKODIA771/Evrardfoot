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

    const base = IPTV_DNS.trim().replace(/\/+$/, "");

    const url =
      `${base}/live/${IPTV_USERNAME.trim()}` +
      `/${IPTV_PASSWORD.trim()}` +
      `/${String(stream_id).trim()}.m3u8`;

    const response = await fetch(url);

    return res.status(200).json({
      status: response.status,
      ok: response.ok,
      finalUrl: url,
    });

  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
}
