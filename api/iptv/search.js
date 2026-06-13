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

    const q =
      String(req.query.q || "")
        .trim()
        .toLowerCase();

    if (!q) {
      return res.status(200).json({
        movies: [],
        series: [],
        total: 0
      });
    }

    const base =
      IPTV_DNS.replace(/\/+$/, "");

    const moviesUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_vod_streams`;

    const seriesUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_series`;

    const [
      moviesResponse,
      seriesResponse
    ] = await Promise.all([
      fetch(moviesUrl),
      fetch(seriesUrl)
    ]);

    const moviesData =
      await moviesResponse.json();

    const seriesData =
      await seriesResponse.json();

    const movies =
      (Array.isArray(moviesData)
        ? moviesData
        : [])
      .filter(movie =>
        MOVIE_CATEGORIES.includes(
          String(movie.category_id)
        )
      )
      .filter(movie =>
        String(movie.name || "")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 100)
      .map(movie => ({

        type: "movie",

        name: movie.name,

        stream_id:
          movie.stream_id,

        category_id:
          movie.category_id,

        logo:
          movie.stream_icon,

        container_extension:
          movie.container_extension ||

          "mp4",

        play_url:
          `${base}/movie/` +
          `${IPTV_USERNAME}/` +
          `${IPTV_PASSWORD}/` +
          `${movie.stream_id}.` +
          `${movie.container_extension || "mp4"}`

      }));

    const series =
      (Array.isArray(seriesData)
        ? seriesData
        : [])
      .filter(serie =>
        SERIES_CATEGORIES.includes(
          String(serie.category_id)
        )
      )
      .filter(serie =>
        String(serie.name || "")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 100)
      .map(serie => ({

        type: "series",

        name:
          serie.name,

        series_id:
          serie.series_id,

        category_id:
          serie.category_id,

        logo:
          serie.cover ||

          serie.stream_icon ||

          ""

      }));

    return res.status(200).json({

      movies,

      series,

      total:
        movies.length +
        series.length

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erreur recherche",

      details:
        error.message

    });

  }

}
