const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

function json(res, status, data) {
  res.status(status).json(data);
}

function assertConfig() {
  if (!IPTV_DNS || !IPTV_USERNAME || !IPTV_PASSWORD) {
    throw new Error("Variables IPTV manquantes sur Vercel");
  }
}

export default async function handler(req, res) {
  try {
    assertConfig();

    const base = IPTV_DNS.replace(/\/+$/, "");
    const url =
      `${base}/player_api.php?username=${encodeURIComponent(IPTV_USERNAME)}` +
      `&password=${encodeURIComponent(IPTV_PASSWORD)}` +
      `&action=get_live_categories`;

    const r = await fetch(url);
    const data = await r.json();

    return json(res, 200, data);
  } catch (err) {
    return json(res, 500, {
      error: true,
      message: err.message,
    });
  }
}
