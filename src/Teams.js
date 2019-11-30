import React from "react";
import { Hero } from "./Hero.js";

export function Teams({ players, team }) {
  var num_format = new Intl.NumberFormat("en-CA");
  const heading = team.map(hero => <th key={hero}>{hero}</th>);

  const playerTeams = players
    .filter(player => team.every(hero => player.hasOwnProperty(hero)))
    .map(player => {
      const heroes = team.map(hero => ({ ...player[hero][0], name: hero }));
      return {
        heroes,
        name: Object.values(heroes)[0].player,
        allyCode: Object.values(heroes)[0].allyCode,
        team_gp: heroes.reduce((total, hero) => total + hero.gp, 0)
      };
    })
    .sort((player1, player2) => player2.team_gp - player1.team_gp);

  function getPlayerRow(player, index) {
    const heroCells = [
      ...player.heroes.map(hero => (
        <td key={hero.name + "-details"}>
          <Hero data={hero} />
        </td>
      ))
    ];
    return (
      <tr key={player.name}>
        <td>{index + 1}</td>
        <td key="player-name">
          <a
            href={`https://www.swgoh.gg/p/${player.allyCode}/characters`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {player.name}
          </a>
        </td>
        {heroCells}
        <td key="total-gp">{num_format.format(player.team_gp)}</td>
      </tr>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          {heading}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>{playerTeams.map(getPlayerRow)}</tbody>
    </table>
  );
}
