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

    const base = IPTV_DNS.replace(/\/+$/, "");

    let url =
      `${base}/player_api.php?username=${encodeURIComponent(IPTV_USERNAME)}` +
      `&password=${encodeURIComponent(IPTV_PASSWORD)}` +
      `&action=get_live_streams`;

    if (category_id) {
      url += `&category_id=${encodeURIComponent(category_id)}`;
    }

    const r = await fetch(url);
    const data = await r.json();

    const cleaned = data.map((ch) => ({
      stream_id: ch.stream_id,
      name: ch.name,
      category_id: ch.category_id,
      stream_icon: ch.stream_icon,
      epg_channel_id: ch.epg_channel_id,
      added: ch.added,
      num: ch.num,
      stream_type: ch.stream_type,
    }));

    res.status(200).json(cleaned);
  } catch (err) {
    res.status(500).json({
      error: true,
      message: err.message,
    });
  }
}
