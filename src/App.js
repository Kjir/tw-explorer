import React, { useState } from "react";
import "./App.css";
import { Teams } from "./Teams.js";
import players from "./roster.json";
import teams from "./teams.json";

function App() {
  const [currentTeam, setTeam] = useState(Object.keys(teams)[0]);

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
  return (
    <div className="App">
      <header className="App-header">Teams lists</header>
      {/* <section>
        <h3>Ally code</h3>
        <input type="text"></input>
        <button>Fetch</button>
      </section> */}
      <section>
        <h3>Select team</h3>
        <ul className="teamSelector">{teamSelector}</ul>
      </section>
      <Teams players={players} team={teams[currentTeam]}></Teams>
    </div>
  );
}

export default App;
