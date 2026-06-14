export default async function handler(req, res) {
  try {

    const q = String(req.query.q || "")
      .trim()
      .toLowerCase();

    if (!q) {
      return res.status(200).json({
        movies: [],
        series: [],
        total: 0
      });
    }

    const protocol =
      req.headers["x-forwarded-proto"] || "https";

    const host =
      req.headers.host;

    const catalogUrl =
      `${protocol}://${host}/catalog.json`;

    const catalogResponse =
      await fetch(catalogUrl);

    if (!catalogResponse.ok) {
      throw new Error(
        "Impossible de charger catalog.json"
      );
    }

    const catalog =
      await catalogResponse.json();

    const movies =
      (catalog.movies || [])
        .filter(movie =>
          String(movie.name || "")
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 100);

    const series =
      (catalog.series || [])
        .filter(serie =>
          String(serie.name || "")
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 100);

    return res.status(200).json({
      movies,
      series,
      total:
        movies.length +
        series.length
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Erreur recherche",
      details: error.message
    });

  }
}
