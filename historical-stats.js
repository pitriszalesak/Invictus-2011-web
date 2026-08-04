(() => {
  const historicalStats = {
    updated: "4. 8. 2026",
    intro: "Pořadí spojuje ověřené individuální záznamy z Havířovské, Karvinské a Ostravské futsalové ligy. Započítáváme pouze čísla přiřazená ke konkrétním hráčům, nikoli týmové branky z kontumací.",
    rankings: [
      {
        key: "matches",
        kicker: "Nejvíce zápasů",
        image: "assets/players/jakub-maly.webp",
        imageAlt: "Jakub Malý – lídr dohledaných startů za Invictus 2011",
        leaderDescription: "dohledaných zápasů za Invictus",
        tableCaption: "Prvních deset hráčů podle počtu dohledaných zápasů za Invictus 2011",
        valueLabel: "Zápasy",
        rows: [
          { name: "Jakub Malý", value: 88 },
          { name: "Jakub Mojzeš", value: 87 },
          { name: "David Vallo", value: 78 },
          { name: "Petr Zálešák", value: 77 },
          { name: "Jakub Čespiva", value: 70 },
          { name: "Tomáš Malý", value: 53 },
          { name: "Jakub Horňák", value: 32 },
          { name: "Filip Hrbek", value: 27 },
          { name: "Adam Sivera", value: 23 },
          { name: "Martin Myšák", value: 21 }
        ]
      },
      {
        key: "goals",
        kicker: "Nejvíce gólů",
        image: "assets/players/jakub-cespiva.webp",
        imageAlt: "Jakub Čespiva – nejlepší dohledaný střelec Invictus 2011",
        leaderDescription: "dohledaných gólů za Invictus",
        tableCaption: "Prvních deset hráčů podle počtu dohledaných gólů za Invictus 2011",
        valueLabel: "Góly",
        rows: [
          { name: "Jakub Čespiva", value: 54 },
          { name: "David Vallo", value: 42 },
          { name: "Petr Zálešák", value: 28 },
          { name: "Tomáš Malý", value: 25 },
          { name: "Jakub Malý", value: 21 },
          { name: "Daniel Klimša", value: 13 },
          { name: "Ján Štromp", value: 9 },
          { name: "Adam Sivera", value: 5 },
          { name: "Martin Myšák", value: 5 },
          { name: "Tomáš Poncza", value: 4 }
        ]
      }
    ],
    coverage: [
      {
        league: "Havířov",
        description: "Dohledané hráčské řádky sezon 2015/16, 2020/22 a 2022/23–2025/26: zápasy i góly."
      },
      {
        league: "Karviná",
        description: "Sezony 2019/20 a 2021/22 včetně nadstavby: zápasy i góly."
      },
      {
        league: "Ostrava",
        description: "Sezony 2023/24–2025/26: góly. FAČR v souhrnné tabulce neuvádí počet hráčských startů, proto je do žebříčku zápasů nepřičítáme."
      }
    ],
    sources: [
      {
        label: "Futsal Havířov",
        url: "https://www.futsalhavirov.cz/klub/invictus-2011/"
      },
      {
        label: "Futsal Karviná 2019/20",
        url: "https://futsalkarvina.cz/statistiky.asp?filtrpost=&filtrtym=313&kategorie=1LIGA&order1=strely&order2=tm&sezona=2020-3"
      },
      {
        label: "Futsal Karviná 2021/22",
        url: "https://futsalkarvina.cz/statistiky.asp?filtrpost=&filtrtym=313&limit=&order2=tym&sezona=20223LIGA"
      },
      {
        label: "FAČR – Invictus Ostrava",
        url: "https://www.fotbal.cz/futsal/club/club/a84ff330-691f-4980-b9c5-d063357697c5"
      }
    ]
  };

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const renderRanking = (ranking) => {
    const leader = ranking.rows[0];
    const rows = ranking.rows.map((row, index) => `
      <tr${index === 0 ? ' class="is-leader"' : ""}>
        <td>${index + 1}.</td>
        <th scope="row">${escapeHtml(row.name)}</th>
        <td>${row.value}</td>
      </tr>`).join("");

    return `
      <section class="history-ranking-card" aria-labelledby="${ranking.key}-ranking-title">
        <div class="history-ranking-leader">
          <figure class="history-ranking-photo">
            <img src="${ranking.image}" alt="${escapeHtml(ranking.imageAlt)}" width="1024" height="1400" loading="lazy">
          </figure>
          <div class="history-ranking-leader-copy">
            <span class="history-ranking-kicker">${escapeHtml(ranking.kicker)}</span>
            <h3 id="${ranking.key}-ranking-title">${escapeHtml(leader.name)}</h3>
            <strong>${leader.value}</strong>
            <p>${escapeHtml(ranking.leaderDescription)}</p>
          </div>
        </div>
        <div class="history-ranking-table-wrap">
          <table class="history-ranking-table">
            <caption class="sr-only">${escapeHtml(ranking.tableCaption)}</caption>
            <thead>
              <tr><th>Pořadí</th><th>Hráč</th><th>${escapeHtml(ranking.valueLabel)}</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>`;
  };

  const renderCoverage = () => `
    <div class="history-source-coverage" aria-labelledby="history-source-title">
      <div>
        <p class="eyebrow">Rozsah evidence</p>
        <h3 id="history-source-title">Co je v součtech zahrnuto</h3>
      </div>
      <ul>
        ${historicalStats.coverage.map((item) => `<li><strong>${escapeHtml(item.league)}</strong><span>${escapeHtml(item.description)}</span></li>`).join("")}
      </ul>
    </div>`;

  const renderSources = () => {
    const sourceLinks = historicalStats.sources.map((source) =>
      `<a href="${source.url}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a>`
    );
    const joinedSources = `${sourceLinks.slice(0, -1).join(", ")} a ${sourceLinks.at(-1)}`;

    return `Zdroje: ${joinedSources}. Starší karvinské a ostravské ročníky bez kompletní individuální evidence nejsou dopočítávány odhadem. Aktualizováno ${historicalStats.updated}.`;
  };

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const renderHistoricalStats = () => {
    setText("[data-history-intro]", historicalStats.intro);

    document.querySelectorAll("[data-history-leaderboards-grid]").forEach((element) => {
      element.innerHTML = historicalStats.rankings.map(renderRanking).join("");
    });

    document.querySelectorAll("[data-history-source-coverage]").forEach((element) => {
      element.innerHTML = renderCoverage();
    });

    document.querySelectorAll("[data-history-ranking-note]").forEach((element) => {
      element.innerHTML = renderSources();
    });

    const matchesLeader = historicalStats.rankings.find((ranking) => ranking.key === "matches").rows[0];
    const goalsLeader = historicalStats.rankings.find((ranking) => ranking.key === "goals").rows[0];

    setText("[data-record-matches-value]", matchesLeader.value);
    setText("[data-record-matches-name]", matchesLeader.name);
    setText("[data-record-matches-copy]", "Nejvíce dohledaných startů za Invictus v dostupných ligových záznamech.");
    setText("[data-record-goals-value]", goalsLeader.value);
    setText("[data-record-goals-name]", goalsLeader.name);
    setText("[data-record-goals-copy]", "Nejlepší doložený střelec klubu v dostupných ligových záznamech.");
    setText("[data-records-note]", `Hráčské statistiky spojují dohledané individuální záznamy z Havířovské, Karvinské a Ostravské futsalové ligy. Aktualizováno ${historicalStats.updated}.`);
  };

  window.HISTORICAL_STATS = historicalStats;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHistoricalStats, { once: true });
  } else {
    renderHistoricalStats();
  }
})();
