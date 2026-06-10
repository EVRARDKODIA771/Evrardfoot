export default function handler(req, res) {
  try {
    const { stream_id } = req.query;

    if (!stream_id) {
      return res.status(400).json({
        error: true,
        message: "stream_id manquant",
      });
    }

    return res.status(200).json({
      url: `/api/iptv/proxy?stream_id=${encodeURIComponent(stream_id)}`,
      stream_id,
      format: "proxy",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message,
    });
  }
}
