const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

const FR_SERIES_CATEGORIES = [
  "654","659","666","445","1337","1338",
  "1379","660","656","665","664","1386"
];

export default async function handler(req,res){

  try{

    const base =
      IPTV_DNS.replace(/\/+$/,"");

    const url =
      `${base}/player_api.php` +
      `?username=${IPTV_USERNAME}` +
      `&password=${IPTV_PASSWORD}` +
      `&action=get_series`;

    const response =
      await fetch(url);

    const data =
      await response.json();

    const series =
      data
      .filter(serie =>
        FR_SERIES_CATEGORIES.includes(
          String(serie.category_id)
        )
      )
      .sort(
        (a,b)=>
          Number(b.last_modified || 0)
          -
          Number(a.last_modified || 0)
      )
      .slice(0,30);

    res.status(200).json(series);

  }catch(error){

    res.status(500).json({
      error:error.message
    });

  }

}
