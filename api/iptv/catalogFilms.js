const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

const MOVIE_CATEGORIES = [
  "390",
  "1473",
  "432",
  "440",
  "485",
  "477",
  "479",
  "854",
  "847",
  "842",
  "855",
  "843",
  "853",
  "850",
  "1281",
  "867",
  "856",
  "868",
  "858",
  "866",
  "860",
  "585",
  "848",
  "862",
  "852",
  "859",
  "833",
  "834"
];

export default async function handler(req, res) {
  try {
    const base = IPTV_DNS.replace(/\/+$/, "");

    const url =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_vod_streams`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Xtream HTTP ${response.status}`);
    }

    const data = await response.json();

    const movies = (Array.isArray(data) ? data : [])
      .filter(movie =>
        MOVIE_CATEGORIES.includes(
          String(movie.category_id)
        )
      )
      .map(movie => ({
        type: "movie",

        name: movie.name || "",

        stream_id: movie.stream_id,

        category_id: movie.category_id,

        logo: movie.stream_icon || "",

        container_extension:
          movie.container_extension || "mp4"
      }))
      .sort((a, b) =>
        a.name.localeCompare(
          b.name,
          "fr",
          { sensitivity: "base" }
        )
      );

    return res.status(200).json({
      total: movies.length,
      movies
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Erreur catalog films",
      details: error.message
    });

  }
}
