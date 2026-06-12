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

  window.parent.postMessage(
    {
      type: "OPEN_VIDEO",
      url: url,
      stream_id: channel.stream_id
    },
    "*"
  );
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
          IPTV FRANCE
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
        background:#0d0d0d;
        color:white;
      }

      .header{
        height:65px;
        display:flex;
        align-items:center;
        padding:0 25px;
        background:#111;
        border-bottom:1px solid #202020;
      }

      .logo{
        font-size:16px;
        font-weight:700;
        letter-spacing:1px;
      }

      .content{
        padding:25px;
      }

      .searchContainer{
        margin-bottom:20px;
      }

      .searchInput{
        width:100%;
        max-width:500px;
        height:46px;
        background:#171717;
        border:1px solid #2c2c2c;
        border-radius:12px;
        padding:0 15px;
        color:white;
        font-size:14px;
        outline:none;
        transition:.2s;
      }

      .searchInput:focus{
        border-color:#666;
      }

      .searchInput::placeholder{
        color:#888;
      }

      .section h2{
        font-size:15px;
        font-weight:500;
        margin-bottom:20px;
        color:#e8e8e8;
      }

      .grid{
        display:grid;
        grid-template-columns:
          repeat(auto-fill,minmax(220px,1fr));
        gap:18px;
      }

      .card{
        background:#171717;
        border:1px solid #232323;
        border-radius:14px;
        overflow:hidden;
        cursor:pointer;
        transition:all .25s ease;
      }

      .card:hover{
        transform:translateY(-4px);
        border-color:#666;
      }

      .logoBox{
        height:130px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#111;
      }

      .logoBox img{
        max-width:85%;
        max-height:85%;
        object-fit:contain;
      }

      .fallback{
        width:80px;
        height:50px;
        background:#2a2a2a;
        border-radius:8px;
        display:flex;
        justify-content:center;
        align-items:center;
      }

      .name{
        padding:14px;
        font-size:13px;
        color:#f1f1f1;
      }

      .loading{
        padding:40px;
        color:#aaa;
      }

      `}</style>

    </div>
  );
}
