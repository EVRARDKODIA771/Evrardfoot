const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

const MOVIE_CATEGORY = "390";
const SERIES_CATEGORY = "654";

export default async function handler(req, res) {

  try {

    const q =
      String(req.query.q || "")
        .trim()
        .toLowerCase();

    if (!q) {
      return res.status(200).json({
        movies: [],
        series: []
      });
    }

    const base =
      IPTV_DNS.replace(/\/+$/, "");

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
      moviesData
        .filter(movie =>
          String(movie.name || "")
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 100)
        .map(movie => ({
          type: "movie",
          name: movie.name,
          stream_id: movie.stream_id,
          logo: movie.stream_icon,
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
          String(serie.name || "")
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 100)
        .map(serie => ({
          type: "series",
          name: serie.name,
          series_id: serie.series_id,
          logo: serie.cover
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
      error: error.message
    });

  }

}
