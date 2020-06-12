import React, { useState, useEffect } from "react";
import "./App.css";
import { Teams } from "./Teams.js";
import teams from "./teams.json";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  useParams,
  Switch,
} from "react-router-dom";
import slugify from "slugg";

function unslugify(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function throttledFetch(url, index, options = {}) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    return fetch(url, options);
  }
  return new Promise((resolve) =>
    setTimeout(() => fetch(url, options).then(resolve), index * 700)
  );
}
async function fetchGuildInfo(allyCode, setRoster, setFetching, setFetched) {
  if (!allyCode || allyCode.length < 9) return [];
  saveLastAllyCode(allyCode);
  setFetching(`guild ${allyCode}`);
  const response = await throttledFetch(
    `https://api.swgoh.help/swgoh/guild/${allyCode}`,
    0,
    { method: "GET" }
  );
  const guild = (await response.json())[0] || {};
  setFetching(`players`);
  setFetched(0);
  setRoster([]);

  guild.roster.forEach((player, index, { length }) => {
    throttledFetch(
      `https://api.swgoh.help/swgoh/player/${player.allyCode}`,
      index
    )
      .then((response) => {
        setFetching(`player ${player.name} (${index + 1}/${length})`);
        setFetched((n) => {
          return n + 1;
        });
        return response;
      })
      .then((response) => response.json())
      .then((player) => setRoster((r) => [...r, player[0]]));
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

function SelectedTeams({ ...attrs }) {
  var { team: teamName } = useParams();
  if (!teamName) {
    teamName = slugify(Object.keys(teams)[0]);
  }
  return <Teams team={teams[unslugify(teamName)]} {...attrs}></Teams>;
}

function App() {
  const [roster, setRoster] = useState([]);
  const [guild, setGuild] = useState({ allyCode: getLastAllyCode() });
  const [fetching, setFetching] = useState(null);
  const [fetched, setFetched] = useState(1);
  const [requiredGP, setRequiredGP] = useState(80000);

  useEffect(() => {
    if (!guild || !guild.members) {
      return;
    }
    if (guild.members === roster.length) {
      setFetching(null);
    }
  }, [guild, roster]);

  function fetchRoster() {
    fetchGuildInfo(
      guild.allyCode,
      setRoster,
      setFetching,
      setFetched
    ).then((newGuild) => setGuild((g) => ({ ...g, ...newGuild })));
  }

  function updateGuild(event) {
    if (!event.target) {
      return;
    }
    var allyCode = event.target.value;
    setGuild((g) => ({ ...g, allyCode: allyCode }));
  }

  function clearCache() {
    if (window.confirm("Are you sure you want to clear the cache?")) {
      fetch("/cache/clear");
    }
  }

  function updateRequiredGP(event) {
    if (!event.target) {
      return;
    }
    var gp = +event.target.value;
    setRequiredGP(gp);
  }

  var num_format = new Intl.NumberFormat("en-CA");
  const guildName = guild.name
    ? `${guild.name} (${num_format.format(guild.gp)})`
    : "";

  const teamSelector = Object.keys(teams).map((team) => (
    <li key={team}>
      <NavLink to={"/team/" + slugify(team)} className="team-link">
        {team}
      </NavLink>
    </li>
  ));

  const fetchingMessage = fetching ? (
    <progress max={guild && guild.members ? guild.members : 50} value={fetched}>
      Fetching {fetching}
    </progress>
  ) : null;
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Territory Wars: Team Explorer</h1>
        </header>
        <section>
          <h3>Ally code</h3>
          <input
            type="text"
            name="allyCode"
            value={guild.allyCode}
            onChange={updateGuild}
          />
          <button onClick={fetchRoster}>Fetch</button>
          <button onClick={clearCache}>Clear cache</button>
          {fetchingMessage}
        </section>
        <section>
          <h1>{guildName}</h1>
          <h3>Select team</h3>
          <ul className="teamSelector">{teamSelector}</ul>
        </section>
        <section>
          <h3>Minimum GP: {num_format.format(requiredGP)}</h3>
          <input
            type="range"
            min="50000"
            max="150000"
            value={requiredGP}
            step="1000"
            className="gp-range"
            onChange={updateRequiredGP}
          />
        </section>
        <Switch>
          <Route path="/team/:team">
            <SelectedTeams players={roster} requiredGP={requiredGP} />
          </Route>
          <Route>
            <SelectedTeams players={roster} requiredGP={requiredGP} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
