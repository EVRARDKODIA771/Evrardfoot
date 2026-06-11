const IPTV_DNS = process.env.IPTV_DNS;

function assertConfig() {
  if (!IPTV_DNS) {
    throw new Error("IPTV_DNS manquant");
  }
}

export default async function handler(req, res) {
  try {
    assertConfig();

    const { path } = req.query;

    if (!path) {
      return res.status(400).send("path manquant");
    }

    const base = IPTV_DNS.trim().replace(/\/+$/, "");

    const remoteUrl =
      `${base}${decodeURIComponent(path)}`;

    const response = await fetch(remoteUrl);

    if (!response.ok) {
      return res
        .status(response.status)
        .send("Segment IPTV introuvable");
    }

    const arrayBuffer = await response.arrayBuffer();

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") ||
        "video/mp2t"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=5"
    );

    return res
      .status(200)
      .send(Buffer.from(arrayBuffer));

  } catch (err) {
    return res.status(500).send(err.message);
  }
}
