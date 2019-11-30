import React from "react";
import { Hero } from "./Hero.js";

export function Teams({ players, team }) {
  var num_format = new Intl.NumberFormat("en-CA");
  const heading = team.map(hero => <th key={hero}>{hero}</th>);

  function adjustGP(currentGP, relics) {
    if (relics <= 2) {
      return currentGP;
    }
    const increments = [0, 759, 1594, 2505, 3492, 4554, 6072, 7969];
    return currentGP + increments[relics - 2];
  }

  const playerTeams = players
    .filter(player =>
      team.every(hero =>
        player.roster.some(playerHero => playerHero.defId === hero)
      )
    )
    .map(player => {
      const heroes = team.map(hero => {
        const playerHero = player.roster.find(
          playerHero => playerHero.defId === hero
        );
        return {
          ...playerHero,
          name: playerHero.defId,
          gp: adjustGP(playerHero.gp, playerHero.relic.currentTier)
        };
      });
      return {
        ...player,
        roster: heroes,
        team_gp: heroes.reduce((total, hero) => total + hero.gp, 0)
      };
    })
    .sort((player1, player2) => player2.team_gp - player1.team_gp);

  function getPlayerRow(player, index) {
    const heroCells = [
      ...player.roster.map(hero => (
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
