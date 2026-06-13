const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

const FR_MOVIE_CATEGORIES = [
  "390","1473","432","440","485","477","479","854",
  "847","842","855","843","853","850","1281","867",
  "856","868","858","866","860","585","848","862",
  "852","859","833","834"
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

    const data = await response.json();

    const movies = data
      .filter(movie =>
        FR_MOVIE_CATEGORIES.includes(
          String(movie.category_id)
        )
      )
      .sort(
        (a,b) =>
          Number(b.added || 0) -
          Number(a.added || 0)
      )
      .slice(0,30);

    res.status(200).json(movies);

  } catch(error) {

    res.status(500).json({
      error:error.message
    });

  }

}
