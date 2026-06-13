// api/iptv/seriesInfo.js

const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

export default async function handler(req, res) {

  try {

    const { series_id } = req.query;

    if (!series_id) {
      return res.status(400).json({
        error: "series_id manquant"
      });
    }

    const base = IPTV_DNS.replace(/\/+$/, "");

    const url =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_series_info` +
      `&series_id=${series_id}`;

    const response = await fetch(url);

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }

}
