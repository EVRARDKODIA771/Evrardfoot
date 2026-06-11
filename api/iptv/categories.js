const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

export default async function handler(req, res) {
  try {
    const base = IPTV_DNS.replace(/\/+$/, "");

    const url =
      `${base}/player_api.php?username=${IPTV_USERNAME}&password=${IPTV_PASSWORD}&action=get_live_categories`;

    const response = await fetch(url);
    const categories = await response.json();

    const franceCategories = categories.filter((cat) =>
      String(cat.category_name || "").toUpperCase().includes("FRANCE")
    );

    res.status(200).json(franceCategories);
  } catch (error) {
    res.status(500).json({
      error: "Erreur chargement catégories IPTV",
      details: error.message,
    });
  }
}
