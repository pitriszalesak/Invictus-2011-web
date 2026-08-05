(() => {
  const data = window.SEASON_ARCHIVE_DATA;
  const grid = document.querySelector("[data-season-archive-grid]");
  const filters = [...document.querySelectorAll("[data-archive-filter]")];
  const count = document.querySelector("[data-archive-count]");
  if (!data || !grid) return;

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const statusLabels = {
    complete: "Výsledek doložen",
    partial: "Částečný archiv",
    current: "Probíhající sezona"
  };

  const seasonId = (season) => `sezona-${season.replace("/", "-")}`;

  const renderPhoto = (season) => season.teamPhoto
    ? `<figure class="season-archive-team-photo"><img src="${escapeHtml(season.teamPhoto)}" alt="${escapeHtml(season.teamPhotoAlt)}" width="1600" height="1066" loading="lazy"></figure>`
    : `<div class="season-archive-team-photo is-missing"><img src="assets/logo-invictus-2011.webp" alt="" width="180" height="132" loading="lazy"><span>Týmová fotografie<br>se hledá</span></div>`;

  const renderCompetitions = (season) => season.competitions.length
    ? season.competitions.map((competition) => `
        <li>
          <div><span>${escapeHtml(competition.name)}</span><strong>${escapeHtml(competition.placement)}</strong></div>
          <p>${escapeHtml(competition.record)}</p>
        </li>`).join("")
    : `<li class="is-empty"><div><span>Rozpis soutěží</span><strong>Čekáme na zveřejnění</strong></div><p>Bilance a umístění budou doplněny po rozehrání sezony.</p></li>`;

  const renderSources = (season) => season.sources.length
    ? `<div class="season-archive-sources">${season.sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)} ↗</a>`).join("")}</div>`
    : `<p class="season-archive-source-missing">Uvítáme fotografii, ročenku nebo vlastní archivní záznam k této sezoně.</p>`;

  const renderCard = (season) => `
    <article class="season-archive-card is-${escapeHtml(season.status)}" id="${seasonId(season.season)}">
      <div class="season-archive-media">
        ${renderPhoto(season)}
        <figure class="season-archive-kit">
          <img src="${escapeHtml(season.kitPhoto)}" alt="Dres Invictu používaný v sezoně ${escapeHtml(season.season)} – ${escapeHtml(season.kitLabel)}" width="720" height="960" loading="lazy">
          <figcaption><span>Dres sezony</span><strong>${escapeHtml(season.kitLabel)}</strong></figcaption>
        </figure>
      </div>
      <div class="season-archive-body">
        <header class="season-archive-card-head">
          <div><p>Sezona</p><h2>${escapeHtml(season.season)}</h2></div>
          <span class="season-archive-status">${statusLabels[season.status]}</span>
        </header>
        <ul class="season-archive-competitions">${renderCompetitions(season)}</ul>
        <div class="season-archive-facts">
          <section>
            <span>Nejlepší střelec</span>
            ${season.topScorer
              ? `<strong>${escapeHtml(season.topScorer.name)}</strong><p>${escapeHtml(season.topScorer.goals)} · ${escapeHtml(season.topScorer.note)}</p>`
              : `<strong>Údaj se doplňuje</strong><p>Kompletní střelecká tabulka není k dispozici.</p>`}
          </section>
          <section>
            <span>Okamžik sezony</span>
            <p>${escapeHtml(season.moment)}</p>
          </section>
        </div>
        ${renderSources(season)}
      </div>
    </article>`;

  const render = (filter = "all") => {
    const seasons = data.seasons.filter((season) => filter === "all"
      || (filter === "current" && season.status === "current")
      || season.competitions.some((competition) => competition.key === filter));
    grid.innerHTML = seasons.map(renderCard).join("");
    count.textContent = `${seasons.length} ${seasons.length === 1 ? "sezona" : seasons.length < 5 ? "sezony" : "sezon"}`;
  };

  filters.forEach((button) => button.addEventListener("click", () => {
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render(button.dataset.archiveFilter);
  }));

  render();
})();
