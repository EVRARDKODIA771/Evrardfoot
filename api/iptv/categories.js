const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

function json(res, status, data) {
  return res.status(status).json(data);
}

function assertConfig() {
  if (!IPTV_DNS || !IPTV_USERNAME || !IPTV_PASSWORD) {
    throw new Error("Variables IPTV manquantes sur Vercel");
  }
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default async function handler(req, res) {
  try {
    assertConfig();

    const base = IPTV_DNS.trim().replace(/\/+$/, "");
    const username = IPTV_USERNAME.trim();
    const password = IPTV_PASSWORD.trim();

    const url =
      `${base}/player_api.php?username=${encodeURIComponent(username)}` +
      `&password=${encodeURIComponent(password)}` +
      `&action=get_live_categories`;

    const r = await fetch(url);
    const data = await r.json();

    if (!Array.isArray(data)) {
      return json(res, 502, {
        error: true,
        message: "Réponse IPTV invalide pour les catégories",
        raw: data,
      });
    }

    const filtered = data.filter((cat) =>
      normalizeText(cat.category_name).includes("france")
    );

    return json(res, 200, filtered);
  } catch (err) {
    return json(res, 500, {
      error: true,
      message: err.message,
    });
  }
}
