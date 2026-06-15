import React, { useEffect, useMemo, useState } from "react";

export default function SerieFilms() {
  const ACCESS_PASSWORD = "14082022";

  const IPTV_DNS = "http://rbvbi.candymarta.com";
  const IPTV_USERNAME = "9SF5YVV";
  const IPTV_PASSWORD = "RXXPJ9E";

  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem("iptv_auth") === "ok"
  );

  const [password, setPassword] = useState("");
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [featured, setFeatured] = useState(null);

  const [selectedSerie, setSelectedSerie] = useState(null);
  const [serieDetails, setSerieDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (authenticated) {
      loadContent();
    }
  }, [authenticated]);

useEffect(() => {

  if (!authenticated) return;

  const timer = setTimeout(async () => {

    try {

      if (!search.trim()) {

        loadContent();
        return;

      }

      setLoading(true);

      const response = await fetch(
        `/api/iptv/search?q=${encodeURIComponent(search)}`
      );

      const data = await response.json();

      setMovies(data.movies || []);
      setSeries(data.series || []);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }, 500);

  return () => clearTimeout(timer);

}, [search]);

  async function loadContent() {
    try {
      setLoading(true);

const response = await fetch("/api/iptv/serieFilms?limit=15");
      const data = await response.json();

      const loadedMovies = data.movies || [];
      const loadedSeries = data.series || [];

      setMovies(loadedMovies);
      setSeries(loadedSeries);

      const all = [...loadedMovies, ...loadedSeries];

      if (all.length > 0) {
        const random =
          all[Math.floor(Math.random() * all.length)];

        setFeatured(random);
      }
    } catch (error) {
      console.error(error);
      alert("Erreur chargement SGJFilm");
    } finally {
      setLoading(false);
    }
  }

  function cleanTitle(name) {
    return String(name || "")
      .replace(/^FR\s*-\s*/i, "")
      .trim();
  }

  function openMovie(movie) {
    const url =
      movie.play_url ||
      `${IPTV_DNS}/movie/${IPTV_USERNAME}/${IPTV_PASSWORD}/${movie.stream_id}.${movie.container_extension}`;

    window.open(url, "_self");
  }

  async function openSerie(serie) {
    try {
      setSelectedSerie(serie);
      setSerieDetails(null);
      setModalLoading(true);

      const response = await fetch(
        `/api/iptv/seriesInfo?series_id=${serie.series_id}`
      );

      const data = await response.json();

      setSerieDetails(data);
    } catch (error) {
      console.error(error);
      alert("Erreur chargement épisodes");
    } finally {
      setModalLoading(false);
    }
  }

  function closeModal() {
    setSelectedSerie(null);
    setSerieDetails(null);
    setModalLoading(false);
  }

  function openEpisode(episode) {
    const url =
      `${IPTV_DNS}/series/` +
      `${IPTV_USERNAME}/` +
      `${IPTV_PASSWORD}/` +
      `${episode.id}.` +
      `${episode.container_extension}`;

    window.open(url, "_self");
  }

  const heroImage =
    featured?.logo ||
    featured?.cover ||
    "/bg.jpeg";

  const heroTitle =
    cleanTitle(featured?.name) || "SGJFilm";

  const heroType =
    featured?.type === "movie"
      ? "Film"
      : featured?.type === "series"
      ? "Série"
      : "Streaming";

  const episodesBySeason =
    serieDetails?.episodes || {};

  if (!authenticated) {
    return (
      <div className="sgj-page auth-page">
        <div className="auth-card">
          <div className="auth-logo">SGJFilm</div>

          <h2>Accès privé</h2>

          <p>
            Films et séries français.
          </p>

          <input
            type="password"
            placeholder="Entrez le mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (password === ACCESS_PASSWORD) {
                  localStorage.setItem("iptv_auth", "ok");
                  setAuthenticated(true);
                } else {
                  alert("Mot de passe incorrect");
                }
              }
            }}
          />

          <button
            onClick={() => {
              if (password === ACCESS_PASSWORD) {
                localStorage.setItem("iptv_auth", "ok");
                setAuthenticated(true);
              } else {
                alert("Mot de passe incorrect");
              }
            }}
          >
            Entrer
          </button>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="sgj-page">
      <header className="topbar">
        <div className="brand">
          SGJ<span>Film</span>
        </div>

        <nav className="nav">
          <button
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
          >
            Accueil
          </button>

          <button
            className={activeTab === "movies" ? "active" : ""}
            onClick={() => setActiveTab("movies")}
          >
            Films
          </button>

          <button
            className={activeTab === "series" ? "active" : ""}
            onClick={() => setActiveTab("series")}
          >
            Séries
          </button>
        </nav>

        <input
          className="top-search"
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {loading ? (
        <div className="main-loading">
          Chargement de SGJFilm...
        </div>
      ) : (
        <>
          <section
            className="hero"
            style={{
              backgroundImage: `linear-gradient(90deg, #05070c 0%, rgba(5,7,12,.88) 35%, rgba(5,7,12,.35) 70%, #05070c 100%), url("${heroImage}")`
            }}
          >
            <div className="hero-content">
              <div className="hero-badge">
                {heroType} • Sélection aléatoire
              </div>

              <h1>{heroTitle}</h1>

              <p>
                Films et séries français dans une interface sombre,
                fluide et immersive.
              </p>

              <div className="hero-actions">
                {featured?.type === "movie" && (
                  <button
                    className="play-btn"
                    onClick={() => openMovie(featured)}
                  >
                    ▶ Regarder
                  </button>
                )}

                {featured?.type === "series" && (
                  <button
                    className="play-btn"
                    onClick={() => openSerie(featured)}
                  >
                    ▶ Voir les épisodes
                  </button>
                )}
              </div>
            </div>
          </section>

          <main className="content">
            {(activeTab === "all" || activeTab === "movies") && (
              <Row
                title={`🎬 Films français (${movies.length})`}
                items={movies}
                type="movie"
                cleanTitle={cleanTitle}
                onMovie={openMovie}
                onSerie={openSerie}
              />
            )}

            {(activeTab === "all" || activeTab === "series") && (
              <Row
                title={`📺 Séries françaises (${series.length})`}
                items={series}
                type="series"
                cleanTitle={cleanTitle}
                onMovie={openMovie}
                onSerie={openSerie}
              />
            )}
          </main>
        </>
      )}

      {selectedSerie && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={closeModal}>
              ×
            </button>

            <div
              className="modal-hero"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), #07101c 90%), url("${
                  serieDetails?.info?.backdrop_path?.[0] ||
                  serieDetails?.info?.cover ||
                  selectedSerie.logo
                }")`
              }}
            />

            <div className="modal-body">
              <h2>
                {cleanTitle(
                  serieDetails?.info?.name || selectedSerie.name
                )}
              </h2>

              <p className="modal-plot">
                {serieDetails?.info?.plot ||
                  "Chargement des informations de la série..."}
              </p>

              {modalLoading ? (
                <div className="episodes-loading">
                  Chargement des épisodes...
                </div>
              ) : (
                <div className="seasons">
                  {Object.keys(episodesBySeason).map((seasonKey) => (
                    <div className="season" key={seasonKey}>
                      <h3>Saison {seasonKey}</h3>

                      <div className="episodes">
                        {episodesBySeason[seasonKey].map((episode) => (
                          <button
                            key={episode.id}
                            className="episode"
                            onClick={() => openEpisode(episode)}
                          >
                            <div className="episode-number">
                              {episode.episode_num}
                            </div>

                            <div className="episode-info">
                              <strong>
                                {cleanTitle(episode.title)}
                              </strong>

                              <span>
                                {episode.info?.duration || "Durée inconnue"}
                              </span>
                            </div>

                            <div className="episode-play">
                              ▶
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

function Row({
  title,
  items,
  type,
  cleanTitle,
  onMovie,
  onSerie
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="row">
      <h2>{title}</h2>

      <div className="poster-row">
        {items.map((item) => (
          <div
            key={
              type === "movie"
                ? `movie-${item.stream_id}`
                : `series-${item.series_id}`
            }
            className="poster-card"
            onClick={() => {
              if (type === "movie") {
                onMovie(item);
              } else {
                onSerie(item);
              }
            }}
          >
            <div className="poster-image">
              {item.logo ? (
                <img src={item.logo} alt={item.name} />
              ) : (
                <div className="poster-fallback">
                  SGJ
                </div>
              )}

              <div className="poster-overlay">
                <button>
                  {type === "movie" ? "▶ Regarder" : "▶ Épisodes"}
                </button>
              </div>
            </div>

            <div className="poster-title">
              {cleanTitle(item.name)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = `
.loading-logo{
  font-size:48px;
  font-weight:1000;
  margin-bottom:30px;
}

.loading-logo span{
  color:#4fa3ff;
}

.loading-spinner{
  width:70px;
  height:70px;
  border:5px solid rgba(255,255,255,.12);
  border-top:5px solid #4fa3ff;
  border-radius:50%;
  animation:spin 1s linear infinite;
}

.loading-text{
  margin-top:25px;
  color:#9fc8ff;
  font-size:18px;
  font-weight:800;
}

@keyframes spin{
  from{
    transform:rotate(0deg);
  }
  to{
    transform:rotate(360deg);
  }
}

.main-loading{
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  background:
    radial-gradient(circle at center,
      rgba(0,120,255,.15),
      transparent 50%),
    #05070c;
}
*{
  box-sizing:border-box;
}

.sgj-page{
  min-height:100vh;
  background:
    radial-gradient(circle at top right, rgba(0,120,255,.22), transparent 35%),
    radial-gradient(circle at top left, rgba(0,40,120,.25), transparent 30%),
    #05070c;
  color:white;
  overflow-x:hidden;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.auth-page{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.auth-card{
  width:100%;
  max-width:390px;
  padding:32px;
  border-radius:28px;
  background:
    linear-gradient(180deg, rgba(15,22,40,.96), rgba(5,8,15,.96));
  border:1px solid rgba(80,150,255,.22);
  box-shadow:
    0 0 60px rgba(0,120,255,.18),
    0 25px 80px rgba(0,0,0,.65);
}

.auth-logo{
  font-size:32px;
  font-weight:1000;
  letter-spacing:1px;
  margin-bottom:25px;
  background:linear-gradient(90deg,#fff,#63a8ff,#fff);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

.auth-card h2{
  margin:0 0 8px;
  font-size:24px;
}

.auth-card p{
  margin:0 0 22px;
  color:#8ca8d0;
}

.auth-card input{
  width:100%;
  height:52px;
  border:none;
  outline:none;
  border-radius:16px;
  background:#0b111d;
  color:white;
  padding:0 16px;
  margin-bottom:15px;
  box-shadow:0 0 0 1px rgba(255,255,255,.08);
}

.auth-card button{
  width:100%;
  height:52px;
  border:none;
  border-radius:16px;
  color:white;
  font-weight:800;
  cursor:pointer;
  background:linear-gradient(135deg,#005eff,#35a3ff);
  box-shadow:0 0 30px rgba(0,120,255,.35);
}

.topbar{
  position:fixed;
  top:0;
  left:0;
  right:0;
  z-index:50;
  height:78px;
  display:flex;
  align-items:center;
  gap:28px;
  padding:0 42px;
  background:linear-gradient(180deg, rgba(5,7,12,.92), rgba(5,7,12,.55));
  backdrop-filter:blur(18px);
  border-bottom:1px solid rgba(255,255,255,.06);
}

.brand{
  font-size:28px;
  font-weight:1000;
  letter-spacing:1px;
  white-space:nowrap;
}

.brand span{
  color:#4fa3ff;
}

.nav{
  display:flex;
  gap:8px;
}

.nav button{
  border:none;
  background:transparent;
  color:#8da8cf;
  cursor:pointer;
  padding:10px 14px;
  border-radius:999px;
  font-weight:700;
  transition:.25s;
}

.nav button:hover,
.nav button.active{
  color:white;
  background:rgba(60,140,255,.16);
}

.top-search{
  margin-left:auto;
  width:330px;
  height:46px;
  border:none;
  outline:none;
  border-radius:999px;
  color:white;
  padding:0 18px;
  background:rgba(15,22,40,.9);
  box-shadow:
    0 0 0 1px rgba(90,150,255,.16),
    0 0 24px rgba(0,120,255,.12);
}

.top-search::placeholder{
  color:#7590b6;
}

.hero{
  min-height:78vh;
  padding:150px 50px 80px;
  background-size:cover;
  background-position:center;
  display:flex;
  align-items:center;
}

.hero-content{
  max-width:690px;
}

.hero-badge{
  display:inline-flex;
  padding:9px 15px;
  border-radius:999px;
  font-size:13px;
  font-weight:800;
  color:#c9ddff;
  background:rgba(25,70,130,.32);
  border:1px solid rgba(100,170,255,.25);
  backdrop-filter:blur(12px);
}

.hero h1{
  margin:22px 0 14px;
  font-size:clamp(38px,7vw,82px);
  line-height:.95;
  letter-spacing:-2px;
  font-weight:1000;
  text-shadow:0 8px 40px rgba(0,0,0,.7);
}

.hero p{
  max-width:560px;
  font-size:18px;
  line-height:1.7;
  color:#c1d2ea;
}

.hero-actions{
  margin-top:28px;
  display:flex;
  gap:14px;
}

.play-btn{
  height:52px;
  padding:0 24px;
  border:none;
  border-radius:16px;
  color:white;
  cursor:pointer;
  font-size:15px;
  font-weight:900;
  background:linear-gradient(135deg,#006bff,#4aadff);
  box-shadow:0 0 35px rgba(0,120,255,.42);
  transition:.25s;
}

.play-btn:hover{
  transform:translateY(-2px) scale(1.03);
}

.content{
  position:relative;
  z-index:5;
  margin-top:-70px;
  padding:0 42px 70px;
}

.row{
  margin-bottom:46px;
}

.row h2{
  margin:0 0 18px;
  font-size:25px;
  font-weight:900;
}

.poster-row{
  display:flex;
  gap:18px;
  overflow-x:auto;
  padding:8px 0 28px;
  scroll-behavior:smooth;
}

.poster-row::-webkit-scrollbar{
  height:9px;
}

.poster-row::-webkit-scrollbar-thumb{
  background:rgba(80,150,255,.35);
  border-radius:999px;
}

.poster-card{
  min-width:205px;
  max-width:205px;
  cursor:pointer;
  transition:.35s;
}

.poster-card:hover{
  transform:scale(1.08) translateY(-8px);
  z-index:10;
}

.poster-image{
  position:relative;
  height:305px;
  overflow:hidden;
  border-radius:18px;
  background:#0c1320;
  border:1px solid rgba(90,150,255,.16);
  box-shadow:0 18px 45px rgba(0,0,0,.55);
}

.poster-image img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  transition:.4s;
}

.poster-card:hover img{
  transform:scale(1.08);
  filter:brightness(.72);
}

.poster-overlay{
  position:absolute;
  inset:0;
  display:flex;
  align-items:flex-end;
  padding:14px;
  opacity:0;
  background:
    linear-gradient(180deg, transparent 35%, rgba(0,0,0,.88));
  transition:.3s;
}

.poster-card:hover .poster-overlay{
  opacity:1;
}

.poster-overlay button{
  width:100%;
  height:42px;
  border:none;
  border-radius:12px;
  color:white;
  font-weight:900;
  cursor:pointer;
  background:linear-gradient(135deg,#006bff,#4aadff);
}

.poster-title{
  margin-top:11px;
  font-size:14px;
  font-weight:800;
  color:#edf5ff;
  line-height:1.35;
}

.poster-fallback{
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:1000;
  font-size:34px;
  color:#72b6ff;
  background:linear-gradient(135deg,#07111f,#10274a);
}

.main-loading{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#84b6ff;
  font-size:20px;
  font-weight:800;
}

.modal-backdrop{
  position:fixed;
  inset:0;
  z-index:200;
  display:flex;
  justify-content:center;
  align-items:flex-start;
  padding:45px 18px;
  background:rgba(0,0,0,.78);
  backdrop-filter:blur(10px);
  overflow-y:auto;
}

.modal{
  width:min(950px,100%);
  overflow:hidden;
  border-radius:28px;
  background:#07101c;
  border:1px solid rgba(95,160,255,.25);
  box-shadow:
    0 0 80px rgba(0,120,255,.22),
    0 30px 100px rgba(0,0,0,.75);
  position:relative;
  animation:modalIn .25s ease-out;
}

@keyframes modalIn{
  from{
    opacity:0;
    transform:scale(.96) translateY(18px);
  }
  to{
    opacity:1;
    transform:scale(1) translateY(0);
  }
}

.close-btn{
  position:absolute;
  top:18px;
  right:18px;
  z-index:5;
  width:44px;
  height:44px;
  border:none;
  border-radius:50%;
  background:rgba(0,0,0,.72);
  color:white;
  font-size:31px;
  cursor:pointer;
}

.modal-hero{
  height:330px;
  background-size:cover;
  background-position:center;
}

.modal-body{
  padding:30px;
}

.modal-body h2{
  margin:0 0 12px;
  font-size:34px;
  font-weight:1000;
}

.modal-plot{
  max-width:780px;
  color:#b7cae7;
  line-height:1.7;
  margin:0 0 26px;
}

.episodes-loading{
  padding:35px;
  text-align:center;
  color:#7db4ff;
  font-weight:800;
}

.season{
  margin-top:24px;
}

.season h3{
  margin:0 0 14px;
  color:#ffffff;
  font-size:22px;
}

.episodes{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.episode{
  width:100%;
  display:flex;
  align-items:center;
  gap:14px;
  padding:14px;
  border:none;
  border-radius:16px;
  cursor:pointer;
  text-align:left;
  color:white;
  background:rgba(255,255,255,.045);
  transition:.25s;
}

.episode:hover{
  background:rgba(65,145,255,.18);
  transform:translateX(5px);
}

.episode-number{
  width:42px;
  height:42px;
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex:none;
  font-weight:1000;
  background:linear-gradient(135deg,#005eff,#4aadff);
}

.episode-info{
  display:flex;
  flex-direction:column;
  gap:4px;
  min-width:0;
}

.episode-info strong{
  font-size:15px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.episode-info span{
  font-size:13px;
  color:#91a9c9;
}

.episode-play{
  margin-left:auto;
  color:#67afff;
  font-size:20px;
}

@media(max-width:800px){

  .topbar{
    height:auto;
    min-height:78px;
    padding:14px 18px;
    flex-wrap:wrap;
    gap:12px;
  }

  .brand{
    font-size:24px;
  }

  .nav{
    order:3;
    width:100%;
    overflow-x:auto;
  }

  .top-search{
    width:100%;
    margin-left:0;
    order:2;
  }

  .hero{
    min-height:68vh;
    padding:155px 22px 70px;
  }

  .hero h1{
    font-size:42px;
  }

  .hero p{
    font-size:15px;
  }

  .content{
    padding:0 20px 50px;
    margin-top:-35px;
  }

  .poster-card{
    min-width:155px;
    max-width:155px;
  }

  .poster-image{
    height:235px;
    border-radius:15px;
  }

  .modal-backdrop{
    padding:20px 10px;
  }

  .modal{
    border-radius:22px;
  }

  .modal-hero{
    height:230px;
  }

  .modal-body{
    padding:22px;
  }

  .modal-body h2{
    font-size:27px;
  }

  .episode-info strong{
    white-space:normal;
  }
}

`;
