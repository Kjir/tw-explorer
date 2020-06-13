import React, { useState } from "react";
import "./TeamManager.css";

function CharacterImage({ teamName, character, deleteChar, size = "128" }) {
  if (Array.isArray(character)) {
    return (
      <div
        className="multiple-choice"
        key={`${teamName}-multiple-${character.join(",")}`}
      >
        {character.map((c) => (
          <CharacterImage
            key={`${teamName}-${c}`}
            teamName={teamName}
            character={c}
            deleteChar={deleteChar}
            size="64"
          />
        ))}
      </div>
    );
  }
  const charName = character.defId || character;
  return (
    <span className="character-image">
      <img
        src={`https://swgoh.gg/game-asset/u/${charName}/`}
        alt={charName}
        width={size}
        height={size}
        key={`${teamName}-${charName}`}
      />
      <button onClick={() => deleteChar(charName)} className="delete">
        X
      </button>
    </span>
  );
}

function AddCharacterButton({ onClick }) {
  return (
    <span className="add-character">
      <button onClick={onClick}>&#43;</button>
    </span>
  );
}

function AddCharacter({ addChar, cancel }) {
  const [charName, setCharName] = useState();
  return (
    <div>
      <h3>Add character</h3>
      <label htmlFor="char-name">Character defId:</label>
      <input
        name="char-name"
        type="text"
        onChange={({ target }) => setCharName(target.value)}
      />
      <button onClick={() => addChar(charName)} className="primary">
        Save
      </button>
      <button onClick={cancel} className="secondary">
        Cancel
      </button>
    </div>
  );
}

function TeamRow({ teamName, team, addCharacter, deleteCharacter }) {
  const teamPictures = team.map((c) => (
    <CharacterImage
      key={`${teamName}-${JSON.stringify(c)}`}
      teamName={teamName}
      character={c}
      deleteChar={deleteCharacter}
    />
  ));
  const [showAddChar, setShowAddChar] = useState(false);

  function cancel() {
    setShowAddChar(false);
  }

  function addChar(charName) {
    addCharacter(charName);
    setShowAddChar(false);
  }

  return (
    <li key={teamName}>
      <h2>{teamName}</h2>

      <div className="character-list">
        {teamPictures}
        {team.length < 5 ? (
          <AddCharacterButton onClick={() => setShowAddChar(true)} />
        ) : null}
      </div>
      {showAddChar ? <AddCharacter cancel={cancel} addChar={addChar} /> : null}
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
  function addCharacter(teamName, charName) {
    setTeams((oldTeams) => ({
      ...oldTeams,
      [teamName]: [...oldTeams[teamName], charName],
    }));
  }

  function deleteCharacter(teamName, charName) {
    setTeams((oldTeams) => {
      const updatedTeam = oldTeams[teamName]
        .filter((char) => char !== charName)
        .map((char) =>
          Array.isArray(char) ? char.filter((c) => c !== charName) : char
        );

      return {
        ...oldTeams,
        [teamName]: updatedTeam,
      };
    });
  }

  const teamsList = !teams
    ? null
    : Object.keys(teams).map((t) => {
        return (
          <TeamRow
            key={`teamrow-${t}`}
            teamName={t}
            team={teams[t]}
            addCharacter={addCharacter.bind(undefined, t)}
            deleteCharacter={deleteCharacter.bind(undefined, t)}
          />
        );
      });
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
