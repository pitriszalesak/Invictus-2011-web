(() => {
  const data = window.KARVINA_DATA;
  const menuButton = document.querySelector(".menu-button");
  const nav = document.querySelector("#main-nav");
  const cards = document.querySelector("#season-cards");
  const list = document.querySelector("#match-list");
  const count = document.querySelector("#match-count");
  const filters = [...document.querySelectorAll("[data-season]")];

  document.querySelector("#year").textContent = new Date().getFullYear();
  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });

  const totals = data.seasons.reduce((sum, season) => ({
    matches: sum.matches + season.matches,
    wins: sum.wins + season.wins,
    draws: sum.draws + season.draws,
    losses: sum.losses + season.losses,
    goalsFor: sum.goalsFor + season.goalsFor,
    goalsAgainst: sum.goalsAgainst + season.goalsAgainst
  }), { matches: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });

  document.querySelector("#total-seasons").textContent = data.seasons.length;
  document.querySelector("#total-matches").textContent = totals.matches;
  document.querySelector("#total-record").textContent = `${totals.wins}–${totals.draws}–${totals.losses}`;
  document.querySelector("#total-score").textContent = `${totals.goalsFor}:${totals.goalsAgainst}`;

  cards.innerHTML = data.seasons.map((season) => `
    <article class="season-card ${season.detail ? "has-detail" : ""}">
      <div class="season-card-top">
        <div><span>${season.league}</span><h3>${season.season}</h3></div>
        <strong>${season.placement}</strong>
      </div>
      <div class="season-record">
        <div><b>${season.matches}</b><span>Z</span></div>
        <div><b>${season.wins}</b><span>V</span></div>
        <div><b>${season.draws}</b><span>R</span></div>
        <div><b>${season.losses}</b><span>P</span></div>
        <div><b>${season.goalsFor}:${season.goalsAgainst}</b><span>Skóre</span></div>
      </div>
      <p>${season.note}</p>
      <a href="${season.source}" target="_blank" rel="noopener">Ověřit ve zdroji ↗</a>
    </article>
  `).join("");

  function renderMatches(season = "all") {
    const matches = data.matches.filter((match) =>
      season === "all" || match.season.startsWith(season)
    );
    count.textContent = `${matches.length} ${matches.length === 1 ? "zápas" : matches.length < 5 ? "zápasy" : "zápasů"}`;
    list.innerHTML = matches.map((match) => {
      const opponent = match.home === "INVICTUS 2011" ? match.away : match.home;
      const invictusHome = match.home === "INVICTUS 2011";
      const shownScore = invictusHome ? match.score : match.score.split(":").reverse().join(":");
      return `
        <details class="match-card result-${match.result.toLowerCase()}">
          <summary>
            <span class="match-result">${match.result}</span>
            <span class="match-date">${match.date.replace(/^(so|ne)\s/, "")}<small>${match.time} · ${match.season}</small></span>
            <span class="match-opponent"><small>Invictus 2011</small>${opponent}</span>
            <strong>${shownScore}</strong>
            <span class="match-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div class="match-detail">
            <div class="match-facts">
              <p><span>Poločasy</span><strong>${match.halftime || "neuvedeno"}</strong></p>
              <p><span>Střelci Invictu</span><strong>${match.invictusScorers || "neuvedeni"}</strong></p>
              <p><span>Žluté karty</span><strong>${match.invictusYellow || "—"}</strong></p>
              <p><span>Červené karty</span><strong>${match.invictusRed || "—"}</strong></p>
            </div>
            <div class="match-roster">
              <span>Sestava Invictu</span>
              <p>${match.invictusRoster ? match.invictusRoster.replace(/,$/, "") : "Archiv sestavu neuvádí."}</p>
            </div>
            <a href="${match.source}" target="_blank" rel="noopener">Originální zápis č. ${match.matchNo} ↗</a>
          </div>
        </details>
      `;
    }).join("");
  }

  filters.forEach((button) => button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.toggle("is-active", item === button));
    renderMatches(button.dataset.season);
  }));

  const playerMap = new Map();
  const getPlayer = (name) => {
    const normalizedName = name.trim();
    if (!playerMap.has(normalizedName)) {
      playerMap.set(normalizedName, { goals: 0, appearances: 0, yellow: 0, red: 0 });
    }
    return playerMap.get(normalizedName);
  };

  for (const match of data.matches) {
    const roster = [...new Set(match.invictusRoster.split(",").map((name) => name.trim()).filter(Boolean))];
    roster.forEach((name) => {
      getPlayer(name).appearances += 1;
    });

    for (const part of match.invictusScorers.split(",")) {
      const found = part.trim().match(/^(\d+)×\s+(.+)$/);
      if (!found) continue;
      getPlayer(found[2]).goals += Number(found[1]);
    }

    const addCards = (value, cardType) => {
      for (const part of value.split(",")) {
        const found = part.trim().match(/^(\d+)×\s+(.+)$/);
        if (!found) continue;
        const surname = found[2].trim();
        const fullName = [...playerMap.keys()].find((name) => name === surname || name.startsWith(`${surname} `)) || surname;
        getPlayer(fullName)[cardType] += Number(found[1]);
      }
    };
    addCards(match.invictusYellow, "yellow");
    addCards(match.invictusRed, "red");
  }

  const scorers = [...playerMap]
    .filter(([, stats]) => stats.goals > 0)
    .sort((a, b) => b[1].goals - a[1].goals || b[1].appearances - a[1].appearances || a[0].localeCompare(b[0], "cs"));
  document.querySelector("#scorers-body").innerHTML = scorers.map(([player, stats], index) => `
    <tr>
      <td>${index + 1}.</td>
      <th scope="row">${player}</th>
      <td>${stats.appearances}</td>
      <td>${stats.goals}</td>
      <td>${stats.yellow}</td>
      <td>${stats.red}</td>
    </tr>
  `).join("");

  renderMatches();
})();
