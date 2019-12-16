import React, { useState, useEffect } from "react";
import { Hero } from "./Hero.js";
import gameData from "./gameData.json";
import statsCalculator from "swgoh-stat-calc";
import statsTranslations from "./eng_us.json";

statsCalculator.setGameData(gameData);

async function getTeamStats(playerTeams) {
  let heroes = playerTeams.flatMap(player => player.roster);
  statsCalculator.calcRosterStats(heroes, {
    gameStyle: true,
    language: statsTranslations
  });
  return heroes.reduce((heroesMap, currentHero) => {
    return { ...heroesMap, [currentHero.id]: currentHero };
  }, {});
}

function adjustGP(currentGP, relics) {
  if (relics <= 2) {
    return currentGP;
  }
  const increments = [0, 759, 1594, 2505, 3492, 4554, 6072, 7969];
  return currentGP + increments[relics - 2];
}

function getBestHero(heroes, playerRoster) {
  const availableHeroes = playerRoster.filter(playerHero =>
    heroes.includes(playerHero.defId)
  );
  return availableHeroes.sort(
    (h1, h2) =>
      adjustGP(h2.gp, h2.relic.currentTier) -
      adjustGP(h1.gp, h1.relic.currentTier)
  )[0];
}

function matchesThreshold(threshold, playerHero) {
  if (playerHero.gp < 6000) {
    return false;
  }

  if (!threshold) {
    return true;
  }

  if (threshold.gearLevel && playerHero.gear < threshold.gearLevel) {
    return false;
  }
  return true;
}

function isUsableHero(hero, playerHero) {
  if (Array.isArray(hero)) {
    return hero.includes(playerHero.defId);
  }
  if (hero.defId) {
    return playerHero.defId === hero.defId;
  }
  return playerHero.defId === hero;
}

function getPlayersWithTeam(players, team) {
  return players
    .filter(
      player =>
        player &&
        team.every(hero => player.roster.some(isUsableHero.bind(null, hero)))
    )
    .map(player => {
      return {
        ...player,
        roster: team.map(hero => {
          if (Array.isArray(hero)) {
            return getBestHero(hero, player.roster);
          } else {
            return player.roster.find(isUsableHero.bind(null, hero));
          }
        })
      };
    });
}

function getSortedPlayers(players, team, heroStats = {}) {
  return players
    .map(player => {
      const heroes = team.map(hero => {
        const playerHero = player.roster.find(isUsableHero.bind(null, hero));
        return {
          ...(heroStats[playerHero.id] || playerHero),
          name: playerHero.defId,
          gp: adjustGP(playerHero.gp, playerHero.relic.currentTier),
          matchesThreshold: matchesThreshold(hero.threshold, playerHero)
        };
      });
      return {
        ...player,
        roster: heroes,
        team_gp: heroes.reduce((total, hero) => total + hero.gp, 0)
      };
    })
    .sort((player1, player2) => player2.team_gp - player1.team_gp);
}

async function enrichPlayerTeams(players, team, setPlayerTeams) {
  const playersWithTeam = getPlayersWithTeam(players, team);
  setPlayerTeams(getSortedPlayers(playersWithTeam, team));
  const heroStats = await getTeamStats(playersWithTeam);
  setPlayerTeams(getSortedPlayers(playersWithTeam, team, heroStats));
}

export function Teams({ players, team }) {
  var num_format = new Intl.NumberFormat("en-CA");
  const heading = team.map(hero =>
    Array.isArray(hero) ? (
      <th key={hero.join("-")}>{hero.join("/")}</th>
    ) : (
      <th key={hero}>{hero.defId ? hero.defId : hero}</th>
    )
  );

  const [playerTeams, setPlayerTeams] = useState([]);
  useEffect(() => {
    enrichPlayerTeams(players, team, setPlayerTeams);
  }, [players, team]);

  function getPlayerRow(player, index) {
    const heroCells = [
      ...player.roster.map(hero => (
        <td
          key={hero.name + "-details"}
          className={hero.matchesThreshold ? null : "incomplete"}
        >
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
