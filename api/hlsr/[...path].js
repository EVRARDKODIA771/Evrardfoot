export default function handler(req, res) {
  return res.status(200).json({
    url: req.url,
    query: req.query,
  });
}
