import React, { useState, useEffect } from "react";
import "./App.css";
import { Teams } from "./Teams.js";
import teams from "./teams.json";

function throttledFetch(url, index, options = {}) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    return fetch(url, options);
  }
  return new Promise(resolve =>
    setTimeout(() => fetch(url, options).then(resolve), index * 700)
  );
}
async function fetchGuildInfo(allyCode, setRoster, setFetching) {
  if (!allyCode || allyCode.length < 9) return [];
  saveLastAllyCode(allyCode);
  setFetching(`guild ${allyCode}`);
  const response = await throttledFetch(
    `https://api.swgoh.help/swgoh/guild/${allyCode}`,
    0,
    { method: "GET" }
  );
  const guild = (await response.json())[0];
  setFetching(`players`);
  setRoster([]);

  guild.roster.forEach((player, index, { length }) => {
    throttledFetch(
      `https://api.swgoh.help/swgoh/player/${player.allyCode}`,
      index
    )
      .then(response => {
        setFetching(`player ${player.name} (${index + 1}/${length})`);
        return response;
      })
      .then(response => response.json())
      .then(player => setRoster(r => [...r, player[0]]));
  });

  return guild;
}

function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
}

function getLastAllyCode() {
  if (!storageAvailable("localStorage")) {
    return "";
  }

  return window.localStorage.getItem("lastAllyCode") || "";
}

function saveLastAllyCode(allyCode) {
  if (!storageAvailable("localStorage")) {
    return;
  }

  window.localStorage.setItem("lastAllyCode", allyCode);
}

function App() {
  const [currentTeam, setTeam] = useState(Object.keys(teams)[0]);
  const [roster, setRoster] = useState([]);
  const [guild, setGuild] = useState({ allyCode: getLastAllyCode() });
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

  function clearCache() {
    if (window.confirm("Are you sure you want to clear the cache?")) {
      fetch("/cache/clear");
    }
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
        <button onClick={clearCache}>Clear cache</button>
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
