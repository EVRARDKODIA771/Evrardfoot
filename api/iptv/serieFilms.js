const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

const MOVIE_CATEGORY = "390";
const SERIES_CATEGORY = "654";

export default async function handler(req, res) {

  try {

    const base =
      IPTV_DNS.replace(/\/+$/, "");

    const limit =
      Number(req.query.limit || 15);

    const moviesUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_vod_streams` +
      `&category_id=${MOVIE_CATEGORY}`;

    const seriesUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_series` +
      `&category_id=${SERIES_CATEGORY}`;

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
      Array.isArray(moviesData)
        ? moviesData
            .sort(
              (a, b) =>
                Number(b.added || 0) -
                Number(a.added || 0)
            )
            .slice(0, limit)
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

            }))
        : [];

    const series =
      Array.isArray(seriesData)
        ? seriesData
            .sort(
              (a, b) =>
                Number(
                  b.last_modified || 0
                ) -
                Number(
                  a.last_modified || 0
                )
            )
            .slice(0, limit)
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

                "",

              plot:
                serie.plot ||

                "",

              rating:
                serie.rating ||

                0

            }))
        : [];

    return res.status(200).json({

      movies,

      series,

      totalMovies:
        movies.length,

      totalSeries:
        series.length

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Erreur chargement SGJFilm",

      details:
        error.message

    });

  }

}
