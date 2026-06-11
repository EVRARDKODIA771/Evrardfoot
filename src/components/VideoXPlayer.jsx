import React from "react";

export default function VideoXPlayer() {

  const params = new URLSearchParams(window.location.search);

  const stream = decodeURIComponent(
    params.get("stream") || ""
  );

  const name = decodeURIComponent(
    params.get("name") || "Chaîne"
  );

  if (!stream) {
    return (
      <div
        style={{
          background: "#000",
          color: "#fff",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
        }}
      >
        Flux introuvable
      </div>
    );
  }

  return (
    <div className="playerPage">

      <div className="topBar">

        <button
          className="backBtn"
          onClick={() => window.history.back()}
        >
          ← Retour
        </button>

        <div className="title">
          {name}
        </div>

      </div>

      <iframe
        title={name}
        src={stream}
        allow="autoplay; fullscreen"
        allowFullScreen
        className="player"
      />

      <style>{`

      .playerPage{
        width:100vw;
        height:100vh;
        background:#000;
        overflow:hidden;
      }

      .topBar{
        height:55px;
        background:#111;
        display:flex;
        align-items:center;
        padding:0 15px;
        border-bottom:1px solid #222;
      }

      .backBtn{
        background:#222;
        color:white;
        border:none;
        border-radius:8px;
        padding:8px 14px;
        cursor:pointer;
        transition:.2s;
      }

      .backBtn:hover{
        background:#333;
      }

      .title{
        margin-left:15px;
        color:white;
        font-size:14px;
        font-weight:600;
      }

      .player{
        width:100%;
        height:calc(100vh - 55px);
        border:none;
        background:black;
      }

      `}</style>

    </div>
  );
}
