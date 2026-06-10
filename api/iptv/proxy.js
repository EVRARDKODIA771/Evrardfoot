const IPTV_DNS = process.env.IPTV_DNS;
const IPTV_USERNAME = process.env.IPTV_USERNAME;
const IPTV_PASSWORD = process.env.IPTV_PASSWORD;

function assertConfig() {
  if (!IPTV_DNS || !IPTV_USERNAME || !IPTV_PASSWORD) {
    throw new Error("Variables IPTV manquantes sur Vercel");
  }
}

export default async function handler(req, res) {
  try {
    assertConfig();

    const { stream_id } = req.query;

    if (!stream_id) {
      return res.status(400).json({
        error: true,
        message: "stream_id manquant",
      });
    }

    const base = IPTV_DNS.trim().replace(/\/+$/, "");
    const url =
      `${base}/live/${IPTV_USERNAME.trim()}` +
      `/${IPTV_PASSWORD.trim()}` +
      `/${String(stream_id).trim()}.ts`;

    const response = await fetch(url);

    if (!response.ok || !response.body) {
      return res.status(response.status).json({
        error: true,
        message: "Flux IPTV indisponible",
      });
    }

    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(Buffer.from(chunk));
        },
        close() {
          res.end();
        },
        abort(err) {
          console.error(err);
          res.end();
        },
      })
    );
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
}
