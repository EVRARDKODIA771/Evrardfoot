// api/iptv/testSeries.js

const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

export default async function handler(req, res) {

  const url =
    `${IPTV_DNS}/player_api.php` +
    `?username=${IPTV_USERNAME}` +
    `&password=${IPTV_PASSWORD}` +
    `&action=get_series`;

  const response = await fetch(url);

  const data = await response.json();

  res.status(200).json(data.slice(0, 20));
}
