import React from "react";
import "./Hero.css";
import { Portrait } from "./Portrait.js";

function getStat(stats, statName) {
  if (!stats) return null;
  const baseStat = stats.base[statName];
  const modStat = (stats.mods ? stats.mods[statName] : 0) || 0;
  const gearStat = (stats.gear ? stats.gear[statName] : 0) || 0;
  return baseStat + modStat + gearStat;
}

function getSpeed({ stats }) {
  return getStat(stats, "Speed");
}

function getHealth({ stats }) {
  return getStat(stats, "Health");
}

export function Hero({ data: hero }) {
  var num_format = new Intl.NumberFormat("en-CA");

  return (
    <div className="hero-badge">
      <Portrait hero={hero} />
      <dl>
        <dt>GP</dt>
        <dd>{num_format.format(hero.gp)}</dd>
        <dt>Speed</dt>
        <dd>{getSpeed(hero)}</dd>
        <dt>Health</dt>
        <dd>{num_format.format(getHealth(hero))}</dd>
      </dl>
    </div>
  );
}
