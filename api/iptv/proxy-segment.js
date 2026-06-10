export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("url manquante");
    }

    const targetUrl = decodeURIComponent(url);

    const response = await fetch(targetUrl);

    if (!response.ok || !response.body) {
      return res.status(response.status).send("Segment indisponible");
    }

    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Cache-Control", "no-store");

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
