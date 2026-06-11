import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Extended() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    try {
      const response = await fetch("/api/iptv/channels");
      const data = await response.json();

      setChannels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openChannel(channel) {
    navigate("/player", {
      state: {
        name: channel.name,
        logo: channel.logo,
        stream_url: channel.stream_url,
      },
    });
  }

  return (
    <div className="iptv-page">

      <div className="topbar">
        <div className="brand">
          TV
        </div>
      </div>

      <div className="content">

        <div className="section-title">
          Chaînes Françaises
        </div>

        {loading ? (
          <div className="loading">
            Chargement...
          </div>
        ) : (
          <div className="channels-grid">

            {channels.map((channel) => (
              <div
                key={channel.stream_id}
                className="channel-card"
                onClick={() => openChannel(channel)}
              >

                <div className="logo-container">

                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                    />
                  ) : (
                    <div className="placeholder">
                      TV
                    </div>
                  )}

                </div>

                <div className="channel-name">
                  {channel.name}
                </div>

              </div>
            ))}

          </div>
        )}
      </div>

      <style>{`
      
      .iptv-page{
        min-height:100vh;
        background:#0f0f0f;
        color:white;
      }

      .topbar{
        height:70px;
        display:flex;
        align-items:center;
        padding:0 40px;
        border-bottom:1px solid #242424;
        background:#101010;
        position:sticky;
        top:0;
        z-index:10;
      }

      .brand{
        font-size:18px;
        font-weight:600;
        letter-spacing:1px;
      }

      .content{
        padding:30px;
      }

      .section-title{
        font-size:16px;
        margin-bottom:20px;
        color:#e0e0e0;
      }

      .channels-grid{
        display:grid;
        grid-template-columns:
          repeat(auto-fill,minmax(200px,1fr));
        gap:18px;
      }

      .channel-card{
        background:#171717;
        border-radius:14px;
        overflow:hidden;
        cursor:pointer;
        transition:.25s;
        border:1px solid #202020;
      }

      .channel-card:hover{
        transform:translateY(-5px);
        border-color:#5f5f5f;
      }

      .logo-container{
        height:120px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#111;
      }

      .logo-container img{
        max-width:85%;
        max-height:85%;
        object-fit:contain;
      }

      .channel-name{
        padding:14px;
        font-size:13px;
        color:#f2f2f2;
      }

      .placeholder{
        width:80px;
        height:50px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#252525;
        border-radius:8px;
      }

      .loading{
        padding:40px;
      }

      `}</style>

    </div>
  );
}
