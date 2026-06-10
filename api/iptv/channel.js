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

    const { category_id } = req.query;

    const base = IPTV_DNS.trim().replace(/\/+$/, "");
    const username = IPTV_USERNAME.trim();
    const password = IPTV_PASSWORD.trim();

    let url =
      `${base}/player_api.php?username=${encodeURIComponent(username)}` +
      `&password=${encodeURIComponent(password)}` +
      `&action=get_live_streams`;

    if (category_id) {
      url += `&category_id=${encodeURIComponent(category_id)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(502).json({
        error: true,
        message: "Réponse IPTV invalide pour les chaînes",
        raw: data,
      });
    }

    const cleaned = data.map((channel) => ({
      stream_id: channel.stream_id,
      name: channel.name,
      category_id: channel.category_id,
      stream_icon: channel.stream_icon,
      epg_channel_id: channel.epg_channel_id,
      added: channel.added,
      num: channel.num,
      stream_type: channel.stream_type,
    }));

    return res.status(200).json(cleaned);
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
}
