const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

export default async function handler(req, res) {
  try {
    const { stream_id } = req.query;

    if (!stream_id) {
      return res.status(400).send("stream_id manquant");
    }

    const base = IPTV_DNS.replace(/\/+$/, "");

    const playlistUrl =
      `${base}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/${stream_id}.m3u8`;

    const response = await fetch(playlistUrl, {
      redirect: "follow",
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .send(`Erreur IPTV ${response.status}`);
    }

    let playlist = await response.text();

    /*
      Exemple IPTV :

      /hlsr/TOKEN/.../56544_2068.ts

      devient :

      /api/hlsr/TOKEN/.../56544_2068.ts
    */

    playlist = playlist.replace(
      /\/hlsr\//g,
      "/api/hlsr/"
    );

    res.setHeader(
      "Content-Type",
      "application/x-mpegurl"
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).send(playlist);

  } catch (error) {
    console.error(error);

    return res.status(500).send(error.message);
  }
}
