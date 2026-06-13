import React, { useEffect, useState } from "react";


export default function Extended() {

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

const ACCESS_PASSWORD = "14082022";

const [authenticated, setAuthenticated] = useState(
  localStorage.getItem("iptv_auth") === "ok"
);

const [password, setPassword] = useState("");

  useEffect(() => {

  if (authenticated) {
    loadChannels();
  }

}, [authenticated]);

  async function loadChannels() {
    try {
      const response = await fetch("/api/iptv/channels");
      const data = await response.json();

      console.log("IPTV CHANNELS:", data);

      setChannels(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

function openChannel(channel) {
  const url =
    `http://rbvbi.candymarta.com/live/9SF5YVV/RXXPJ9E/${channel.stream_id}.m3u8`;

  window.open(url, "_self");
}

  const filteredChannels = channels
    .filter((channel) =>
      channel.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {

      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      const aBein = nameA.includes("bein");
      const bBein = nameB.includes("bein");

      if (aBein && !bBein) return -1;
      if (!aBein && bBein) return 1;

      const aCanal = nameA.includes("canal");
      const bCanal = nameB.includes("canal");

      if (aCanal && !bCanal) return -1;
      if (!aCanal && bCanal) return 1;

      return nameA.localeCompare(nameB);
    });

if (!authenticated) {

  return (

    <div className="page">

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >

        <div
          style={{
            width: "350px",
            background: "#171717",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #2a2a2a"
          }}
        >

          <h2
            style={{
              marginBottom: "20px",
              color: "white"
            }}
          >
            Accès IPTV
          </h2>

          <input
            type="password"
            placeholder="Entrez le mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              height: "46px",
              background: "#111",
              border: "1px solid #333",
              borderRadius: "10px",
              color: "white",
              padding: "0 12px",
              marginBottom: "15px"
            }}
          />

          <button
            style={{
              width: "100%",
              height: "46px",
              border: "none",
              borderRadius: "10px",
              background: "#2d7ef7",
              color: "white",
              cursor: "pointer"
            }}
            onClick={() => {

              if (password === ACCESS_PASSWORD) {

                localStorage.setItem(
                  "iptv_auth",
                  "ok"
                );

                setAuthenticated(true);

              } else {

                alert(
                  "Mot de passe incorrect"
                );

              }

            }}
          >
            Entrer
          </button>

        </div>

      </div>

    </div>

  );
}
  return (
    <div className="page">

      <header className="header">

        <div className="logo">
          SGJ Foot
        </div>

      </header>

      <main className="content">

        <div className="section">

          <div className="searchContainer">

            <input
              type="text"
              placeholder="Rechercher une chaîne..."
              value={search}
              onInput={(e) => setSearch(e.target.value)}
              className="searchInput"
            />

          </div>

          <h2>
            France ({filteredChannels.length})
          </h2>

          {loading ? (
            <div className="loading">
              Chargement...
            </div>
          ) : (
            <div className="grid">

              {filteredChannels.map((channel) => (
                <div
                  key={channel.stream_id}
                  className="card"
                  onClick={() => openChannel(channel)}
                >

                  <div className="logoBox">

                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                      />
                    ) : (
                      <div className="fallback">
                        TV
                      </div>
                    )}

                  </div>

                  <div className="name">
                    {channel.name}
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </main>

      <style>{`

.page{
  min-height:100vh;
  background:
    radial-gradient(circle at top right,
      rgba(0,102,255,.25),
      transparent 35%),
    radial-gradient(circle at top left,
      rgba(0,50,150,.20),
      transparent 30%),
    #04070d;

  color:white;
  overflow-x:hidden;
}

.header{
  position:sticky;
  top:0;
  z-index:100;

  height:80px;

  display:flex;
  align-items:center;

  padding:0 35px;

  backdrop-filter:blur(20px);

  background:
    rgba(4,7,13,.75);

  border-bottom:
    1px solid rgba(255,255,255,.08);
}

.logo{
  font-size:24px;
  font-weight:900;

  letter-spacing:2px;

  background:
    linear-gradient(
      90deg,
      #ffffff,
      #69a7ff,
      #ffffff
    );

  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

.content{
  padding:35px;
}

.searchContainer{
  margin-bottom:30px;
}

.searchInput{
  width:100%;
  max-width:650px;

  height:58px;

  padding:0 20px;

  font-size:15px;

  border:none;

  border-radius:18px;

  color:white;

  background:
    rgba(15,20,35,.85);

  backdrop-filter:blur(12px);

  box-shadow:
    0 0 0 1px rgba(0,120,255,.15),
    0 0 25px rgba(0,120,255,.15);

  transition:.3s;
}

.searchInput:focus{
  outline:none;

  transform:translateY(-1px);

  box-shadow:
    0 0 0 1px #2b8fff,
    0 0 40px rgba(43,143,255,.5);
}

.searchInput::placeholder{
  color:#7e97be;
}

.section h2{
  font-size:24px;
  font-weight:700;
  margin-bottom:25px;
  color:white;
}

.grid{
  display:grid;

  grid-template-columns:
    repeat(auto-fill,minmax(240px,1fr));

  gap:24px;
}

.card{
  position:relative;

  overflow:hidden;

  border-radius:24px;

  background:
    linear-gradient(
      180deg,
      rgba(15,22,40,.95),
      rgba(6,10,18,.95)
    );

  border:
    1px solid rgba(60,130,255,.18);

  cursor:pointer;

  transition:.35s;

  box-shadow:
    0 10px 30px rgba(0,0,0,.45);
}

.card::before{
  content:"";

  position:absolute;

  inset:-100%;

  background:
    radial-gradient(
      circle,
      rgba(0,120,255,.25),
      transparent 60%
    );

  opacity:0;

  transition:.4s;
}

.card:hover{
  transform:
    translateY(-10px)
    scale(1.03);

  border-color:#3b93ff;

  box-shadow:
    0 0 25px rgba(0,120,255,.25),
    0 0 70px rgba(0,120,255,.15);
}

.card:hover::before{
  opacity:1;
}

.logoBox{
  height:180px;

  display:flex;
  justify-content:center;
  align-items:center;

  background:
    linear-gradient(
      180deg,
      rgba(0,60,180,.18),
      rgba(0,0,0,0)
    );
}

.logoBox img{
  max-width:88%;
  max-height:88%;

  object-fit:contain;

  transition:.35s;
}

.card:hover img{
  transform:scale(1.08);
}

.fallback{
  width:120px;
  height:70px;

  border-radius:16px;

  display:flex;
  align-items:center;
  justify-content:center;

  font-weight:700;

  background:
    linear-gradient(
      135deg,
      #0048d0,
      #0d7dff
    );

  box-shadow:
    0 0 25px rgba(0,120,255,.45);
}

.name{
  padding:18px;

  text-align:center;

  font-size:15px;

  font-weight:600;

  color:#eef5ff;
}

.loading{
  text-align:center;

  padding:80px;

  font-size:18px;

  color:#7ea9ea;
}

@media(max-width:768px){

  .content{
    padding:20px;
  }

  .header{
    padding:0 20px;
  }

  .logo{
    font-size:18px;
  }

  .grid{
    grid-template-columns:
      repeat(auto-fill,minmax(160px,1fr));
  }

  .logoBox{
    height:130px;
  }
}

`}</style>

    </div>
  );
}
