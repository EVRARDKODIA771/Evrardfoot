const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

async function getFranceCategories(base) {
  const url =
    `${base}/player_api.php?username=${IPTV_USERNAME}&password=${IPTV_PASSWORD}&action=get_live_categories`;

  const response = await fetch(url);
  const categories = await response.json();

  return categories.filter((cat) =>
    String(cat.category_name || "").toUpperCase().includes("FRANCE")
  );
}

export default async function handler(req, res) {
  try {
    const base = IPTV_DNS.replace(/\/+$/, "");

    const franceCategories = await getFranceCategories(base);
    const franceCategoryIds = franceCategories.map((cat) => String(cat.category_id));

    const streamsUrl =
      `${base}/player_api.php?username=${IPTV_USERNAME}&password=${IPTV_PASSWORD}&action=get_live_streams`;

    const response = await fetch(streamsUrl);
    const channels = await response.json();

    const franceChannels = channels
      .filter((channel) =>
        franceCategoryIds.includes(String(channel.category_id))
      )
      .map((channel) => ({
        name: channel.name,
        stream_id: channel.stream_id,
        category_id: channel.category_id,
        logo: channel.stream_icon,
        epg_channel_id: channel.epg_channel_id,

        // URL prête pour le frontend, sans exposer directement username/password
        stream_url: `/api/iptv/stream?stream_id=${channel.stream_id}`,
      }));

    res.status(200).json(franceChannels);
  } catch (error) {
    res.status(500).json({
      error: "Erreur chargement chaînes IPTV",
      details: error.message,
    });
  }
}
