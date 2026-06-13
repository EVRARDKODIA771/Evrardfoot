const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

export default async function handler(req, res) {

  try {

    const base = IPTV_DNS.replace(/\/+$/, "");

    const movieCategoriesUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_vod_categories`;

    const seriesCategoriesUrl =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_series_categories`;

    const [
      movieResponse,
      seriesResponse
    ] = await Promise.all([
      fetch(movieCategoriesUrl),
      fetch(seriesCategoriesUrl)
    ]);

    const movieCategories =
      await movieResponse.json();

    const seriesCategories =
      await seriesResponse.json();

    res.status(200).json({

      movieCategories,

      seriesCategories

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

}
