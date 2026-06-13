const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

export default async function handler(req, res) {

  const base =
    IPTV_DNS.replace(/\/+$/, "");

  const url =
    `${base}/player_api.php` +
    `?username=${IPTV_USERNAME}` +
    `&password=${IPTV_PASSWORD}` +
    `&action=get_series` +
    `&category_id=654`;

  const response =
    await fetch(url);

  const data =
    await response.json();

  res.status(200).json({
    total: data.length,
    sample: data.slice(0, 20)
  });

}
