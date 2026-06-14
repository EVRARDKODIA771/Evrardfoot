const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

const SERIES_CATEGORIES = [
  "654",
  "659",
  "666",
  "445",
  "1337",
  "1338",
  "1379",
  "660",
  "656",
  "665",
  "664",
  "1386"
];

export default async function handler(req, res) {
  try {
    const base = IPTV_DNS.replace(/\/+$/, "");

    const url =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_series`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Xtream HTTP ${response.status}`);
    }

    const data = await response.json();

    const series = (Array.isArray(data) ? data : [])
      .filter(serie =>
        SERIES_CATEGORIES.includes(
          String(serie.category_id)
        )
      )
      .map(serie => ({
        type: "series",

        name: serie.name || "",

        series_id: serie.series_id,

        category_id: serie.category_id,

        logo:
          serie.cover ||
          serie.stream_icon ||
          ""
      }))
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          "fr",
          { sensitivity: "base" }
        )
      );

    return res.status(200).json({
      total: series.length,
      series
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Erreur catalog séries",
      details: error.message
    });

  }
}
