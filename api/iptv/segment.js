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
    const remoteUrl = `${base}${decodeURIComponent(path)}`;

    const response = await fetch(remoteUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0 Safari/537.36",
        "Referer": base + "/",
        "Origin": base,
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).send(
        `IPTV ${response.status}\n${text}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "video/mp2t"
    );

    return res
      .status(200)
      .send(Buffer.from(arrayBuffer));

  } catch (err) {
    return res.status(500).send(err.message);
  }
}
