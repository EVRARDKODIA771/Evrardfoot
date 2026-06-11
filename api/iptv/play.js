const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

export default async function handler(req, res) {
  try {
    const { stream_id } = req.query;

    if (!stream_id) {
      return res.status(400).json({
        error: "stream_id manquant",
      });
    }

    const base = IPTV_DNS.replace(/\/+$/, "");

    const targetUrl =
      `${base}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/${stream_id}.m3u8`;

    console.log("Redirect vers :", targetUrl);

    return res.redirect(302, targetUrl);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
}
