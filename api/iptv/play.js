const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

const ACCESS_PASSWORD = "14082022";

export default async function handler(req, res) {
  try {
    const { stream_id, password } = req.query;

    if (password !== ACCESS_PASSWORD) {
      return res.status(403).json({
        error: "Accès refusé",
      });
    }

    if (!stream_id) {
      return res.status(400).json({
        error: "stream_id manquant",
      });
    }

    if (!IPTV_DNS || !IPTV_USERNAME || !IPTV_PASSWORD) {
      return res.status(500).json({
        error: "Configuration IPTV manquante",
      });
    }

    const base = IPTV_DNS.replace(/\/+$/, "");

    const targetUrl =
      `${base}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/${stream_id}.m3u8`;

    console.log("PLAY REQUEST");
    console.log("STREAM:", stream_id);
    console.log("REDIRECT:", targetUrl);

    return res.redirect(302, targetUrl);

  } catch (err) {
    console.error("PLAY ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}
