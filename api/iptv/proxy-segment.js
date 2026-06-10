export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("url manquante");
    }

    const targetUrl = decodeURIComponent(url);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "VLC/3.0.20 LibVLC/3.0.20",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Referer": targetUrl,
        "Origin": new URL(targetUrl).origin,
      },
    });

    if (!response.ok || !response.body) {
      return res.status(response.status).send(`Segment indisponible: ${response.status}`);
    }

    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        res.end();
        break;
      }

      res.write(Buffer.from(value));
    }
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).send(err.message);
    }

    res.end();
  }
}
