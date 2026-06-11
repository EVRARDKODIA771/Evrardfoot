import React, { useEffect, useState } from "react";

export default function Extended() {

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

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

    console.log("OPEN CHANNEL:", channel);

    window.location.href =
      `/player?stream=${encodeURIComponent(
        channel.stream_url
      )}&name=${encodeURIComponent(channel.name)}`;
  }

  return (
    <div className="page">

      <header className="header">
        <div className="logo">
          TV
        </div>
      </header>

      <main className="content">

        <div className="section">

          <h2>France</h2>

          {loading ? (
            <div className="loading">
              Chargement...
            </div>
          ) : (
            <div className="grid">

              {channels.map((channel) => (
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
        font-weight:600;
        letter-spacing:1px;
      }

      .content{
        padding:25px;
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
      }

      `}</style>

    </div>
  );
}
