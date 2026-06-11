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

    const initialUrl =
      `${base}/live/${IPTV_USERNAME}/${IPTV_PASSWORD}/${stream_id}.m3u8`;

    const response = await fetch(initialUrl, {
      redirect: "follow",
    });

    const playlist = await response.text();

    res.setHeader("Content-Type", "text/plain");

    return res.status(200).send(playlist);

  } catch (error) {
    return res.status(500).send(error.message);
  }
}
