import React from "react";
import { Stars } from "./Stars";
import "./Portrait.css";

export function Portrait({ hero }) {
  const zetaCount = hero.skills.filter(
    skill => skill.isZeta && skill.tier === skill.tiers
  ).length;
  const zetas = zetaCount > 0 ? <span className="zetas">{zetaCount}</span> : "";
  const relicCount = hero.relic.currentTier - 2;
  const relics =
    relicCount > 0 ? <div className="relics">{relicCount}</div> : "";
  return (
    <div className="portrait">
      <span className={`gear gear-${hero.gear}`}></span>
      <Stars stars={hero.rarity}></Stars>
      <img
        src={`https://www.swgoh.gg/game-asset/u/${hero.name}/`}
        alt={hero.name}
      />
      {zetas}
      <div className="level">{hero.level}</div>
      {relics}
    </div>
  );
}
