const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

export default async function handler(req, res) {

  try {

    const base = IPTV_DNS.replace(/\/+$/, "");

    //
    // FILMS
    //
    const vodUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_vod_streams`;

    const vodResponse = await fetch(vodUrl);
    const vodData = await vodResponse.json();

    const movies = vodData.map((movie) => ({

      type: "movie",

      name: movie.name,

      stream_id: movie.stream_id,

      category_id: movie.category_id,

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

    //
    // SERIES
    //
    const seriesUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_series`;

    const seriesResponse = await fetch(seriesUrl);
    const seriesData = await seriesResponse.json();

    const series = seriesData.map((serie) => ({

      type: "series",

      name: serie.name,

      series_id: serie.series_id,

      category_id: serie.category_id,

      logo: serie.cover,

      seasons:
        serie.seasons || []

    }));

    return res.status(200).json({

      movies,
      series

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }

}
