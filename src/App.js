import React, { useState, useEffect } from "react";
import "./App.css";
import { Teams } from "./Teams.js";
import teams from "./teams.json";

async function fetchGuildInfo(allyCode, setRoster, setFetching) {
  if (!allyCode || allyCode.length < 9) return [];
  setFetching(`guild ${allyCode}`);
  const response = await fetch(
    `https://api.swgoh.help/swgoh/guild/${allyCode}`,
    { method: "GET" }
  );
  const guild = (await response.json())[0];
  setFetching(`players`);
  setRoster([]);

  guild.roster.forEach((player, index, { length }) => {
    fetch(`https://api.swgoh.help/swgoh/player/${player.allyCode}`)
      .then(response => {
        setFetching(`player ${player.name} (${index + 1}/${length})`);
        return response;
      })
      .then(response => response.json())
      .then(player => setRoster(r => [...r, player[0]]))
      .catch(error => {
        console.error("failed HTTP request", error);
        throw error;
      });
  });

  return guild;
}

function App() {
  const [currentTeam, setTeam] = useState(Object.keys(teams)[0]);
  const [roster, setRoster] = useState([]);
  const [guild, setGuild] = useState({ allyCode: "" });
  const [fetching, setFetching] = useState(null);

  useEffect(() => {
    if (!guild || !guild.members) {
      return;
    }
    if (guild.members === roster.length) {
      setFetching(null);
    }
  }, [guild, roster]);

  function fetchRoster() {
    fetchGuildInfo(guild.allyCode, setRoster, setFetching).then(newGuild =>
      setGuild(g => ({ ...g, ...newGuild }))
    );
  }

  function updateGuild(event) {
    if (!event.target) {
      return;
    }
    setGuild(g => ({ ...g, allyCode: event.target.value }));
  }

  var num_format = new Intl.NumberFormat("en-CA");
  const guildName = guild.name
    ? `${guild.name} (${num_format.format(guild.gp)})`
    : "";

  const teamSelector = Object.keys(teams).map(team => (
    <li key={team}>
      <button
        className={currentTeam === team ? "active" : ""}
        onClick={() => setTeam(team)}
      >
        {team}
      </button>
    </li>
  ));

  const fetchingMessage = fetching ? <div>Fetching {fetching}</div> : null;
  return (
    <div className="App">
      <header className="App-header">Teams lists</header>
      <section>
        <h3>Ally code</h3>
        <input type="text" value={guild.allyCode} onChange={updateGuild} />
        <button onClick={fetchRoster}>Fetch</button>
        {fetchingMessage}
      </section>
      <section>
        <h1>{guildName}</h1>
        <h3>Select team</h3>
        <ul className="teamSelector">{teamSelector}</ul>
      </section>
      <Teams players={roster} team={teams[currentTeam]}></Teams>
    </div>
  );
}

export default App;
