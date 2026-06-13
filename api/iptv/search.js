const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

const FR_MOVIE_CATEGORIES = [
  "390","1473","432","440","485","477","479","854",
  "847","842","855","843","853","850","1281","867",
  "856","868","858","866","860","585","848","862",
  "852","859","833","834"
];

const FR_SERIES_CATEGORIES = [
  "654","659","666","445","1337","1338",
  "1379","660","656","665","664","1386"
];

export default async function handler(req, res) {

  try {

    const q =
      String(req.query.q || "")
        .toLowerCase()
        .trim();

    if (!q) {
      return res.status(200).json({
        movies: [],
        series: []
      });
    }

    const base =
      IPTV_DNS.replace(/\/+$/, "");

    //
    // FILMS
    //
    const vodUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_vod_streams`;

    //
    // SERIES
    //
    const seriesUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_series`;

    const [
      vodResponse,
      seriesResponse
    ] = await Promise.all([
      fetch(vodUrl),
      fetch(seriesUrl)
    ]);

    const vodData =
      await vodResponse.json();

    const seriesData =
      await seriesResponse.json();

    const movies =
      vodData
        .filter(movie =>
          FR_MOVIE_CATEGORIES.includes(
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
            movie.container_extension,

          play_url:
            `${base}/movie/` +
            `${IPTV_USERNAME}/` +
            `${IPTV_PASSWORD}/` +
            `${movie.stream_id}.` +
            `${movie.container_extension}`

        }));

    const series =
      seriesData
        .filter(serie =>
          FR_SERIES_CATEGORIES.includes(
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

          name: serie.name,

          series_id:
            serie.series_id,

          category_id:
            serie.category_id,

          logo:
            serie.cover ||

            serie.stream_icon ||

            "",

          seasons:
            serie.seasons || []

        }));

    return res.status(200).json({

      query: q,

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
