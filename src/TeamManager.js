import React, { useState, useEffect } from "react";
import { unitData } from "./gameData.json";
import "./TeamManager.css";
import { saveFile } from "./utils";

function CharacterImage({ teamName, character, deleteChar, size = "128" }) {
  if (Array.isArray(character) && character.length > 1) {
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
  const currentCharacter = Array.isArray(character) ? character[0] : character;
  if (!currentCharacter) return null;
  const charName = currentCharacter.defId || currentCharacter;
  return (
    <span className="character-image">
      <img
        src={`https://swgoh.gg/game-asset/u/${charName}/`}
        alt={charName}
        title={charName}
        width={size}
        height={size}
        key={`${teamName}-${charName}`}
      />
      {deleteChar ? (
        <button onClick={() => deleteChar(charName)} className="delete">
          X
        </button>
      ) : null}
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
  const [units] = useState(Object.keys(unitData));
  const [charName, setCharName] = useState();
  const [matchingChars, setMatchingChars] = useState(units);
  const [selectedChars, setSelectedChars] = useState([]);

  useEffect(() => {
    if (!charName) {
      setMatchingChars(units.slice(0, 48));
    } else {
      setMatchingChars(
        units
          .filter((char) =>
            char.toLowerCase().includes(charName.toLowerCase().replace(" ", ""))
          )
          .slice(0, 48)
      );
    }
  }, [charName, units]);

  function toggleChar(charName) {
    if (selectedChars.includes(charName)) {
      setSelectedChars((sc) => sc.filter((c) => c !== charName));
    } else {
      setSelectedChars((sc) => [...sc, charName]);
    }
  }

  return (
    <div className="add-character-list">
      <h3>Add character</h3>
      <div>
        <label htmlFor="char-name">Character defId:</label>
        <input
          name="char-name"
          type="text"
          onChange={({ target }) => setCharName(target.value)}
        />
      </div>
      <div>
        {matchingChars.map((charName) => (
          <button
            onClick={() => toggleChar(charName)}
            className={`image-button${
              selectedChars.includes(charName) ? " selected" : ""
            }`}
          >
            <CharacterImage
              key={`charlist-${charName}`}
              character={charName}
              size="64"
            />
          </button>
        ))}
      </div>
      <h4>Selected</h4>
      <div>
        <CharacterImage character={selectedChars} />
      </div>
      <div>
        <button onClick={() => addChar(selectedChars)} className="primary">
          Save
        </button>
        <button onClick={cancel} className="secondary">
          Cancel
        </button>
      </div>
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

function SaveAndRestore({ teams, setTeams }) {
  const [uploadedFile, setUploadedFile] = useState();

  async function importTeams() {
    try {
      const importedTeams = JSON.parse(await uploadedFile.text());
      setTeams(importedTeams);
    } catch (error) {
      console.log("Imported file is invalid");
    }
  }

  return (
    <div>
      <h2>Save &amp; Restore</h2>
      <button onClick={() => saveFile("teams.json", teams)}>
        Export teams
      </button>
      <br />
      <input
        type="file"
        name="team_json"
        onChange={({ target }) => setUploadedFile(target.files[0])}
      />
      <button onClick={importTeams}>Import</button>
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
        .filter((char) =>
          char.defId ? char.defId !== charName : char !== charName
        )
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
      <SaveAndRestore teams={teams} setTeams={setTeams} />
    </section>
  );
}
