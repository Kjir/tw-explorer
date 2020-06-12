import React, { useState } from "react";
import "./TeamManager.css";

function characterImage(teamName, character, size = "128") {
  if (Array.isArray(character)) {
    return (
      <div
        className="multiple-choice"
        key={`${teamName}-multiple-${character.join(",")}`}
      >
        {character.map((c) => characterImage(teamName, c, "64"))}
      </div>
    );
  }
  const charName = character.defId || character;
  return (
    <img
      src={`https://swgoh.gg/game-asset/u/${charName}/`}
      alt={charName}
      width={size}
      height={size}
      key={`${teamName}-${charName}`}
    />
  );
}

function formatTeamRow(teamName, teams) {
  const team = teams[teamName];
  const teamPictures = team.map((c) => characterImage(teamName, c));

  return (
    <li key={teamName}>
      <h2>{teamName}</h2>

      <div className="character-list">{teamPictures}</div>
    </li>
  );
}

function NewTeam({ addTeam }) {
  const [teamName, setTeamName] = useState();

  return (
    <div>
      <label htmlFor="team_name">Team name:</label>
      <input
        type="text"
        name="team_name"
        onChange={({ target }) => setTeamName(target.value)}
      />
      <button
        onClick={() => {
          addTeam(teamName);
          setTeamName("");
        }}
      >
        &#43; Add team
      </button>
    </div>
  );
}

export function TeamManager({ teams, setTeams }) {
  const teamsList = teams
    ? Object.keys(teams).map((t) => formatTeamRow(t, teams))
    : null;

  function addTeam(teamName) {
    setTeams((t) => ({ ...t, [teamName]: [] }));
  }

  return (
    <section className="TeamManager">
      <h1>Team Manager</h1>
      <ul>{teamsList}</ul>
      <NewTeam addTeam={addTeam} />
    </section>
  );
}
