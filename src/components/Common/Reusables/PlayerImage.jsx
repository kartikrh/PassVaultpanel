import React from "react";

export default function PlayerImage({ width = "30px", playerImage, playername, jerseyImage, className = "" }) {
  function isValidLink(string) {
    try {
      new URL(string);
      return true;
    } catch (e) {
      return false;
    }
  }

  return (
    <div className="relative" style={{ width: width, borderRadius: "5px", background: '#f3f4f6' }}>
      
        <img
          src={playerImage  ? playerImage: "images/default-player.avif"}
          alt="Player"
          width={width}
          height={width}
          className="position-absolute rounded object-fit-cover z-2"
        />
      <div className="absolute inset-0">
        <img
          src={jerseyImage ? jerseyImage : 'images/default-jersy.png'}
          alt="Jersey"
          width={width}
          height={width}
          style={{paddingTop: `${width == '30px' ? '1.5rem' : '2.5rem'}`}}
          className={`position-relative rounded object-fit-cover z-10`}
        />
      </div>
    </div>
  );
}
