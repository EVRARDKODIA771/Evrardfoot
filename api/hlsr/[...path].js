const IPTV_DNS = process.env.IPTV_DNS;

export default async function handler(req, res) {
  try {
    const { path } = req.query;

    if (!path || !Array.isArray(path)) {
      return res.status(400).send("Path manquant");
    }

    const base = IPTV_DNS.replace(/\/+$/, "");

    const remoteUrl =
      `${base}/hlsr/${path.join("/")}`;

    console.log("HLS TS PROXY =>", remoteUrl);

    const response = await fetch(remoteUrl);

    if (!response.ok) {
      return res
        .status(response.status)
        .send(`Erreur IPTV: ${response.status}`);
    }

    const buffer =
      Buffer.from(await response.arrayBuffer());

    const contentType =
      response.headers.get("content-type") ||
      "video/mp2t";

    res.setHeader(
      "Content-Type",
      contentType
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    return res.status(200).send(buffer);

  } catch (error) {
    console.error(error);

    return res.status(500).send(error.message);
  }
}
