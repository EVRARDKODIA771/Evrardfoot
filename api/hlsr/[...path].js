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

    console.log("=================================");
    console.log("PATH =", path.join("/"));
    console.log("REMOTE =", remoteUrl);

    const response = await fetch(remoteUrl, {
      redirect: "follow",
    });

    console.log("STATUS =", response.status);
    console.log("FINAL URL =", response.url);
    console.log(
      "CONTENT-TYPE =",
      response.headers.get("content-type")
    );

    if (!response.ok) {
      return res.status(response.status).json({
        remoteUrl,
        finalUrl: response.url,
        status: response.status,
      });
    }

    const buffer =
      Buffer.from(await response.arrayBuffer());

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") ||
      "video/mp2t"
    );

    return res.status(200).send(buffer);

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}
