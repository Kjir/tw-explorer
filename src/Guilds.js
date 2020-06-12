import React, { useState } from "react";
import { Route, NavLink, Switch } from "react-router-dom";
import slugify from "slugg";
import {
  useRouteMatch,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { GuildSelector } from "./GuildSelector";
import { getLastAllyCode } from "./localStorage";
import { Teams } from "./Teams";

function unslugify(slug) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SelectedTeams({ teams, ...attrs }) {
  var { team: teamName } = useParams();
  if (!teamName) {
    teamName = slugify(Object.keys(teams)[0]);
  }
  return <Teams team={teams[unslugify(teamName)]} {...attrs}></Teams>;
}

export function Guilds({ teams }) {
  const [guild, setGuild] = useState({ allyCode: getLastAllyCode() });
  const [roster, setRoster] = useState([]);
  const [requiredGP, setRequiredGP] = useState(80000);
  const { path, url } = useRouteMatch();

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
      <NavLink to={`${url}/team/${slugify(team)}`} className="team-link">
        {team}
      </NavLink>
    </li>
  ));

  return (
    <section>
      <GuildSelector
        guild={guild}
        setGuild={setGuild}
        roster={roster}
        setRoster={setRoster}
      />
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
        <Route path={`${path}/team/:team`}>
          <SelectedTeams teams={teams} players={roster} requiredGP={requiredGP} />
        </Route>
        <Route path={path}>
          <SelectedTeams teams={teams} players={roster} requiredGP={requiredGP} />
        </Route>
      </Switch>
    </section>
  );
}
