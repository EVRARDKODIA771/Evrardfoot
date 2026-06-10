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

    // Récupération des infos du serveur Xtream
    const apiUrl =
      `${base}/player_api.php?username=${encodeURIComponent(IPTV_USERNAME)}` +
      `&password=${encodeURIComponent(IPTV_PASSWORD)}`;

    const apiResponse = await fetch(apiUrl);
    const apiData = await apiResponse.json();

    const server = apiData.server_info || {};

    const protocol =
      server.server_protocol === "https"
        ? "https"
        : "http";

    const host = server.url || new URL(base).hostname;

    const port =
      protocol === "https"
        ? server.https_port
        : server.port;

    const streamUrl =
      `${protocol}://${host}` +
      (port ? `:${port}` : "") +
      `/live/${IPTV_USERNAME.trim()}` +
      `/${IPTV_PASSWORD.trim()}` +
      `/${String(stream_id).trim()}.m3u8`;

    return res.status(200).json({
      url: streamUrl,
      stream_id,
      protocol,
      port,
      format: "m3u8",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
}
