import React, { useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Switch,
} from "react-router-dom";
import { Guilds } from "./Guilds";
import { TeamManager } from "./TeamManager";
import initialTeams from "./teams.json";


function App() {
  const [teams, setTeams] = useState(initialTeams)

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Territory Wars: Team Explorer</h1>
          <nav>
            <ul>
              <li>
                <NavLink to="/guilds">Explore guilds</NavLink>
              </li>
              <li>
                <NavLink to="/teams">Manage teams</NavLink>
              </li>
            </ul>
          </nav>
        </header>
        <Switch>
          <Route path="/teams">
            <TeamManager teams={teams} setTeams={setTeams} />
          </Route>
          <Route path="/guilds">
            <Guilds teams={teams} />
          </Route>
          <Route>
            <Guilds teams={teams} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
