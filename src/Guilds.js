import React, { useState } from "react";
import { Route, NavLink, Switch } from "react-router-dom";
import slugify from "slugg";
import {
  useRouteMatch,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import "./Guilds.css";
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
  const selectedTeam = teams[unslugify(teamName)];
  return <Teams team={selectedTeam} {...attrs}></Teams>;
}

function TeamSelector({ teams }) {
  const { url } = useRouteMatch();

  return (
    <ul className="teamSelector">
      {Object.keys(teams).map((team) => (
        <li key={team}>
          <NavLink to={`${url}team/${slugify(team)}`} className="team-link">
            {team}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function GuildName({ guild, num_format }) {
  function getDate(milliseconds) {
    const d = new Date(milliseconds);
    if (isNaN(d.getTime())) return null;

    return new Date(milliseconds).toLocaleString();
  }

  return guild.name ? (
    <section className="guild-name">
      <img
        src={`https://swgoh.gg/static/img/assets/tex.${guild.bannerLogo}.png`}
        width="128"
        height="128"
        alt={guild.name}
        title={guild.name}
      />
      <div className="guild-title">
        <h1>
          {guild.name} ({num_format.format(guild.gp)})
        </h1>
        {getDate(guild.updated) ? (
          <p>Last updated: {getDate(guild.updated)}</p>
        ) : null}
      </div>
    </section>
  ) : null;
}

export function Guilds({ teams }) {
  const [guild, setGuild] = useState({ allyCode: getLastAllyCode() });
  const [roster, setRoster] = useState([]);
  const [requiredGP, setRequiredGP] = useState(80000);
  const { path } = useRouteMatch();

  function updateRequiredGP(event) {
    if (!event.target) {
      return;
    }
    var gp = +event.target.value;
    setRequiredGP(gp);
  }

  var num_format = new Intl.NumberFormat("en-CA");

  return (
    <section>
      <GuildSelector
        guild={guild}
        setGuild={setGuild}
        roster={roster}
        setRoster={setRoster}
      />
      <GuildName guild={guild} num_format={num_format} />
      <section>
        <h3>Select team</h3>
        <TeamSelector teams={teams} />
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
        <Route path={`${path}team/:team`}>
          <SelectedTeams
            teams={teams}
            players={roster}
            requiredGP={requiredGP}
          />
        </Route>
        <Route path={path}>
          <SelectedTeams
            teams={teams}
            players={roster}
            requiredGP={requiredGP}
          />
        </Route>
      </Switch>
    </section>
  );
}
