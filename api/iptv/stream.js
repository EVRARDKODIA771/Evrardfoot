const response = await fetch(url);

if (!response.ok) {
  return res.status(response.status).send("Flux IPTV indisponible");
}

const playlist = await response.text();

res.setHeader("Content-Type", "text/plain");

return res.status(200).send(playlist);
