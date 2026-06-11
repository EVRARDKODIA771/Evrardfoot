const IPTV_DNS = process.env.IPTV_DNS;

export default async function handler(req, res) {
  const { path } = req.query;

  return res.status(200).json({
    path,
    remoteUrl:
      `${IPTV_DNS.replace(/\/+$/, "")}/hlsr/${decodeURIComponent(path)}`
  });
}
