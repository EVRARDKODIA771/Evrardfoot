const IPTV_DNS = process.env.IPTV_DNS;

export default async function handler(req, res) {
  try {
    const { path } = req.query;

    if (!path) {
      return res.status(400).json({
        error: "path manquant"
      });
    }

    const base = IPTV_DNS.replace(/\/+$/, "");

    const remoteUrl =
      `${base}/hlsr/${decodeURIComponent(path)}`;

    console.log("=================================");
    console.log("SEGMENT PATH =", path);
    console.log("REMOTE URL =", remoteUrl);

    const response = await fetch(remoteUrl, {
      redirect: "follow"
    });

    console.log("STATUS =", response.status);
    console.log("FINAL URL =", response.url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erreur IPTV",
        status: response.status,
        remoteUrl,
        finalUrl: response.url
      });
    }

    const buffer =
      Buffer.from(await response.arrayBuffer());

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") ||
      "video/mp2t"
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).send(buffer);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
