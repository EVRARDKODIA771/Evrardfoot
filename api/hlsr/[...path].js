const IPTV_DNS = process.env.IPTV_DNS;

export default async function handler(req, res) {
  try {
    const { path } = req.query;

    return res.status(200).json({
      routeWorks: true,
      path,
      base: IPTV_DNS
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
