import React from "react";
import "./Hero.css";
import { Portrait } from "./Portrait.js";

export function Hero({ data: hero }) {
  var num_format = new Intl.NumberFormat("en-CA");

  return (
    <div className="hero-badge">
      <Portrait hero={hero} />
      {num_format.format(hero.gp)}
    </div>
  );
}
