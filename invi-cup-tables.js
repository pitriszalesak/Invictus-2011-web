(() => {
  const data = window.INVI_CUP_DATA;
  if (!data) return;

  const timeZone = "Europe/Prague";
  const teamsById = new Map(data.teams.map((team) => [team.id, team]));
  const completedMatches = () => data.matches.filter((match) =>
    Number.isInteger(match.homeScore) &&
    Number.isInteger(match.awayScore) &&
    match.homeScore >= 0 &&
    match.awayScore >= 0
  );

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatTime = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone
    }).format(parsed);
  };

  const formatUpdated = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone
    }).format(parsed);
  };

  const emptyScoreMarkup = (label) => `
    <span class="cup-score-empty" aria-hidden="true"><i></i><b>:</b><i></i></span>
    <span class="sr-only">${escapeHtml(label)} – výsledek zatím nebyl zadán</span>`;

  const resultMarkup = (match, rowTeamId = null) => {
    if (!completedMatches().includes(match)) {
      return emptyScoreMarkup("Zápas");
    }
    const homeFirst = !rowTeamId || rowTeamId === match.home;
    const first = homeFirst ? match.homeScore : match.awayScore;
    const second = homeFirst ? match.awayScore : match.homeScore;
    return `<strong class="cup-score-final"><span>${first}</span><i>:</i><span>${second}</span></strong>`;
  };

  const renderSchedule = () => {
    const target = document.querySelector("[data-cup-schedule]");
    if (!target) return;
    target.innerHTML = `
      <div class="cup-table-scroll" tabindex="0" role="region" aria-label="Rozpis zápasů INVICUPU 2026">
        <table class="cup-schedule-table">
          <thead>
            <tr><th scope="col">#</th><th scope="col">Čas</th><th scope="col">Zápas</th><th scope="col">Výsledek</th></tr>
          </thead>
          <tbody>
            ${data.matches.map((match) => {
              const home = teamsById.get(match.home);
              const away = teamsById.get(match.away);
              return `
                <tr class="${match.home === "invictus" || match.away === "invictus" ? "is-invictus" : ""}">
                  <td data-label="Zápas">${match.number}</td>
                  <td data-label="Čas"><time datetime="${escapeHtml(match.start)}">${escapeHtml(formatTime(match.start))}</time></td>
                  <td data-label="Utkání"><strong>${escapeHtml(home.name)}</strong><span>–</span><strong>${escapeHtml(away.name)}</strong></td>
                  <td data-label="Výsledek">${resultMarkup(match)}</td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  };

  const findMatch = (firstTeam, secondTeam) => data.matches.find((match) =>
    (match.home === firstTeam && match.away === secondTeam) ||
    (match.home === secondTeam && match.away === firstTeam)
  );

  const renderCrossTable = () => {
    const target = document.querySelector("[data-cup-cross-table]");
    if (!target) return;
    target.innerHTML = `
      <div class="cup-table-scroll" tabindex="0" role="region" aria-label="Křížová tabulka výsledků INVICUPU 2026">
        <table class="cup-cross-table">
          <thead>
            <tr>
              <th scope="col">Tým</th>
              ${data.teams.map((team) => `<th scope="col"><abbr title="${escapeHtml(team.name)}">${escapeHtml(team.shortName)}</abbr></th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${data.teams.map((rowTeam) => `
              <tr class="${rowTeam.id === "invictus" ? "is-invictus" : ""}">
                <th scope="row">${escapeHtml(rowTeam.name)}</th>
                ${data.teams.map((columnTeam) => {
                  if (rowTeam.id === columnTeam.id) {
                    return '<td class="is-diagonal" aria-label="Stejný tým">×</td>';
                  }
                  const match = findMatch(rowTeam.id, columnTeam.id);
                  return `<td>${resultMarkup(match, rowTeam.id)}</td>`;
                }).join("")}
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  };

  const calculateStats = (matches, teamIds = new Set(data.teams.map((team) => team.id))) => {
    const stats = new Map(data.teams
      .filter((team) => teamIds.has(team.id))
      .map((team) => [team.id, {
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }]));

    matches.forEach((match) => {
      if (!teamIds.has(match.home) || !teamIds.has(match.away)) return;
      const home = stats.get(match.home);
      const away = stats.get(match.away);
      home.played += 1;
      away.played += 1;
      home.goalsFor += match.homeScore;
      home.goalsAgainst += match.awayScore;
      away.goalsFor += match.awayScore;
      away.goalsAgainst += match.homeScore;

      if (match.homeScore > match.awayScore) {
        home.wins += 1;
        away.losses += 1;
        home.points += data.scoring.win;
        away.points += data.scoring.loss;
      } else if (match.homeScore < match.awayScore) {
        away.wins += 1;
        home.losses += 1;
        away.points += data.scoring.win;
        home.points += data.scoring.loss;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += data.scoring.draw;
        away.points += data.scoring.draw;
      }
    });

    stats.forEach((row) => {
      row.goalDifference = row.goalsFor - row.goalsAgainst;
    });
    return stats;
  };

  const rankStandings = () => {
    const results = completedMatches();
    const overall = calculateStats(results);
    const pointGroups = new Map();

    overall.forEach((row) => {
      if (!pointGroups.has(row.points)) pointGroups.set(row.points, []);
      pointGroups.get(row.points).push(row);
    });

    return [...pointGroups.keys()]
      .sort((a, b) => b - a)
      .flatMap((points) => {
        const group = pointGroups.get(points);
        if (group.length === 1) return group;

        const tiedIds = new Set(group.map((row) => row.team.id));
        const mini = calculateStats(results, tiedIds);
        return group.sort((a, b) => {
          const miniA = mini.get(a.team.id);
          const miniB = mini.get(b.team.id);
          return miniB.points - miniA.points ||
            miniB.goalDifference - miniA.goalDifference ||
            miniB.goalsFor - miniA.goalsFor ||
            b.goalDifference - a.goalDifference ||
            b.goalsFor - a.goalsFor ||
            a.team.seed - b.team.seed;
        });
      });
  };

  const signedNumber = (value) => value > 0 ? `+${value}` : String(value);

  const renderStandings = () => {
    const target = document.querySelector("[data-cup-standings]");
    if (!target) return;
    const standings = rankStandings();
    target.innerHTML = `
      <div class="cup-table-scroll" tabindex="0" role="region" aria-label="Celkové pořadí INVICUPU 2026">
        <table class="cup-standings-table">
          <thead>
            <tr>
              <th scope="col">#</th><th scope="col">Tým</th><th scope="col"><abbr title="Zápasy">Z</abbr></th>
              <th scope="col"><abbr title="Výhry">V</abbr></th><th scope="col"><abbr title="Remízy">R</abbr></th>
              <th scope="col"><abbr title="Prohry">P</abbr></th><th scope="col">Skóre</th>
              <th scope="col"><abbr title="Rozdíl skóre">Rozdíl</abbr></th><th scope="col"><abbr title="Body">B</abbr></th>
            </tr>
          </thead>
          <tbody>
            ${standings.map((row, index) => `
              <tr class="${row.team.id === "invictus" ? "is-invictus" : ""}">
                <td data-label="Pořadí"><strong>${index + 1}.</strong></td>
                <th scope="row">${escapeHtml(row.team.name)}</th>
                <td data-label="Z">${row.played}</td>
                <td data-label="V">${row.wins}</td>
                <td data-label="R">${row.draws}</td>
                <td data-label="P">${row.losses}</td>
                <td data-label="Skóre">${row.goalsFor}:${row.goalsAgainst}</td>
                <td data-label="Rozdíl">${signedNumber(row.goalDifference)}</td>
                <td data-label="Body"><strong>${row.points}</strong></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  };

  const renderUpdated = () => {
    document.querySelectorAll("[data-cup-updated]").forEach((element) => {
      element.textContent = formatUpdated(data.updatedAt);
    });
  };

  const renderTournament = () => {
    renderSchedule();
    renderCrossTable();
    renderStandings();
    renderUpdated();
    document.querySelector("[data-cup-print]")?.addEventListener("click", () => window.print());
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderTournament, { once: true });
  } else {
    renderTournament();
  }
})();
