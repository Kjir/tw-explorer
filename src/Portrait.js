import React from "react";
import { Stars } from "./Stars";
import "./Portrait.css";

export function Portrait({ hero }) {
  const zetas =
    hero.zetas.length > 0 ? (
      <span className="zetas">{hero.zetas.length}</span>
    ) : (
      ""
    );
  return (
    <div className="portrait">
      <span className={`gear gear-${hero.gearLevel}`}></span>
      <Stars stars={hero.starLevel}></Stars>
      <img
        src={`https://www.swgoh.gg/game-asset/u/${hero.name}/`}
        alt={hero.name}
      />
      {zetas}
      <div className="level">{hero.level}</div>
    </div>
  );
}
