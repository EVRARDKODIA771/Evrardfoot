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

    const moviesUrl =
      `${protocol}://${host}/catalogFilms.json`;

    const seriesUrl =
      `${protocol}://${host}/catalogSeries.json`;

    const [
      moviesResponse,
      seriesResponse
    ] = await Promise.all([
      fetch(moviesUrl),
      fetch(seriesUrl)
    ]);

    if (!moviesResponse.ok) {
      throw new Error(
        "Impossible de charger catalogFilms.json"
      );
    }

    if (!seriesResponse.ok) {
      throw new Error(
        "Impossible de charger catalogSeries.json"
      );
    }

    const moviesCatalog =
      await moviesResponse.json();

    const seriesCatalog =
      await seriesResponse.json();

    const movies =
      (moviesCatalog.movies || [])
        .filter(movie =>
          String(movie.name || "")
            .toLowerCase()
            .includes(q)
        )
        .slice(0, 100);

    const series =
      (seriesCatalog.series || [])
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
