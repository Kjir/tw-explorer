import React, { useState, useEffect } from "react";
import "./GuildSelector.css";
import { saveLastAllyCode } from "./localStorage";
import { saveFile } from "./utils";

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

function FetchingMessage({ guild, fetched, fetching }) {
  return fetching ? (
    <div>
      <progress
        max={guild && guild.members ? guild.members : 50}
        value={fetched}
      ></progress>
      <span>Fetching {fetching}</span>
    </div>
  ) : null;
}

function FetchGuild({ guild, setGuild, setRoster, fetching, setFetching }) {
  const [fetched, setFetched] = useState(1);

  function fetchRoster() {
    fetchGuildInfo(
      guild.allyCode,
      setRoster,
      setFetching,
      setFetched
    ).then((newGuild) => setGuild((g) => ({ ...g, ...newGuild })));
  }

  function clearCache() {
    if (window.confirm("Are you sure you want to clear the cache?")) {
      fetch("/cache/clear");
    }
  }

  function updateGuild(event) {
    if (!event.target) {
      return;
    }
    var allyCode = event.target.value;
    setGuild((g) => ({ ...g, allyCode: allyCode }));
  }

  return (
    <div>
      <h3>Ally code</h3>
      <input
        type="text"
        name="allyCode"
        value={guild.allyCode}
        onChange={updateGuild}
      />
      <button onClick={fetchRoster}>Fetch</button>
      <button onClick={clearCache}>Clear cache</button>
      <FetchingMessage guild={guild} fetched={fetched} fetching={fetching} />
    </div>
  );
}

function SaveAndImport({ guild, setGuild, roster, setRoster }) {
  const [uploadedFile, setUploadedFile] = useState();

  async function restoreGuildInfo() {
    const uploadedGuildInfo = JSON.parse(await uploadedFile.text());
    if (uploadedGuildInfo.guild) {
      setGuild(uploadedGuildInfo.guild);
    }
    if (uploadedGuildInfo.roster) {
      setRoster(uploadedGuildInfo.roster);
    }
  }

  return (
    <div>
      <h4>Save &amp; Import</h4>
      <button
        onClick={() =>
          saveFile(`${guild.allyCode}-guild-info.json`, { guild, roster })
        }
      >
        Export guild info
      </button>
      <br />
      <input
        type="file"
        name="guild-info"
        onChange={({ target }) => setUploadedFile(target.files[0])}
      />
      <button onClick={restoreGuildInfo}>Restore guild info</button>
      <br />
    </div>
  );
}

export function GuildSelector({ guild, setGuild, roster, setRoster }) {
  const [fetching, setFetching] = useState(null);

  useEffect(() => {
    if (!guild || !guild.members) {
      return;
    }
    if (guild.members === roster.length) {
      setFetching(null);
    }
  }, [guild, roster]);

  return (
    <section className="GuildSelector">
      <section>
        <FetchGuild
          guild={guild}
          setGuild={setGuild}
          setRoster={setRoster}
          fetching={fetching}
          setFetching={setFetching}
        />
      </section>
      <section>
        <SaveAndImport
          guild={guild}
          roster={roster}
          setGuild={setGuild}
          setRoster={setRoster}
        />
      </section>
    </section>
  );
}
