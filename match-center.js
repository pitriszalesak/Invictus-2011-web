(() => {
  const data = window.MATCH_CENTER_DATA;
  if (!data) return;

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const parseDate = (value) => {
    const parsed = value ? new Date(value) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
  };

  const formatDateTime = (value) => {
    const parsed = parseDate(value);
    if (!parsed) return "Termín bude doplněn";
    const formatted = new Intl.DateTimeFormat("cs-CZ", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric"
    }).format(parsed);
    const datePart = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return `${datePart} · ${formatTime(parsed)}`;
  };

  const formatShortDate = (value) => {
    const parsed = parseDate(value);
    if (!parsed) return "—";
    return new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "numeric"
    }).format(parsed);
  };

  const formatTime = (value) => {
    const parsed = parseDate(value);
    if (!parsed) return "—";
    return new Intl.DateTimeFormat("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(parsed);
  };

  const formatUpdatedDate = (value) => {
    if (!value) return "—";
    const parsed = parseDate(`${value}T12:00:00`);
    return parsed
      ? new Intl.DateTimeFormat("cs-CZ").format(parsed)
      : value;
  };

  const resultState = (result) => {
    if (result.invictusScore > result.opponentScore) {
      return { className: "is-win", label: "Výhra", short: "V" };
    }
    if (result.invictusScore < result.opponentScore) {
      return { className: "is-loss", label: "Prohra", short: "P" };
    }
    return { className: "is-draw", label: "Remíza", short: "R" };
  };

  const logoMarkup = (team, large = false) => `
    <span class="team-logo${large ? " team-logo-large" : ""}">
      <img src="${escapeHtml(team.logo)}" alt="" width="128" height="128" loading="lazy">
    </span>`;

  const getFeaturedEvent = () => {
    const event = data.featuredEvent;
    const start = parseDate(event?.start);
    if (!event || !start) return null;
    const expiresAt = parseDate(event.expiresAt);
    return expiresAt && Date.now() >= expiresAt.getTime() ? null : event;
  };

  const renderStatus = () => {
    const target = document.querySelector("[data-match-center-status]");
    if (!target) return;
    const match = data.nextMatch;
    const event = getFeaturedEvent();
    const hasMatch = Boolean(match && parseDate(match.start));
    const label = hasMatch
      ? "Příští zápas"
      : event?.statusLabel || data.status.label;
    const text = hasMatch
      ? formatDateTime(match.start)
      : event
        ? formatDateTime(event.start)
        : data.status.text;
    target.classList.toggle("has-match", hasMatch || Boolean(event));
    target.innerHTML = `
      <span class="season-status-dot" aria-hidden="true"></span>
      <div>
        <strong>${escapeHtml(label)}</strong>
        <p>${escapeHtml(text)}</p>
      </div>`;
  };

  const renderFeaturedEvent = (card, detailsCard, event) => {
    const start = parseDate(event.start);
    const visual = event.visual;

    card.className = "next-match-card is-featured-event";
    card.innerHTML = `
      <div class="match-card-topline">
        <span>Nejbližší klubová událost</span>
        <time datetime="${escapeHtml(event.start)}">${escapeHtml(formatDateTime(event.start))}</time>
      </div>
      <div class="featured-event-main">
        <time class="featured-event-date" datetime="${escapeHtml(event.start)}">
          <strong>${escapeHtml(new Intl.DateTimeFormat("cs-CZ", { day: "2-digit" }).format(start))}</strong>
          <span>srpna 2026</span>
        </time>
        <div class="featured-event-copy">
          <p>${escapeHtml(event.kicker)}</p>
          <h3>${escapeHtml(event.title)}</h3>
          <dl class="featured-event-facts">
            <div><dt>Začátek</dt><dd>${escapeHtml(formatTime(event.start))}</dd></div>
            <div><dt>Místo</dt><dd>${escapeHtml(event.location)}</dd></div>
            <div><dt>Formát</dt><dd>${escapeHtml(event.format)}</dd></div>
          </dl>
        </div>
      </div>
      <div class="match-countdown" data-match-countdown aria-label="Odpočet do turnaje">
        <div><strong data-countdown-days>--</strong><span>dní</span></div>
        <div><strong data-countdown-hours>--</strong><span>hodin</span></div>
        <div><strong data-countdown-minutes>--</strong><span>minut</span></div>
        <div><strong data-countdown-seconds>--</strong><span>sekund</span></div>
        <p class="sr-only" data-countdown-accessible aria-live="polite"></p>
      </div>
      <p class="match-card-copy">${escapeHtml(event.description)}</p>
      <div class="match-card-actions">
        <a class="button button-primary" href="${escapeHtml(event.detailUrl)}">${escapeHtml(event.detailLabel)}</a>
        <a class="button button-ghost" href="${escapeHtml(event.detailUrl)}#informace">Praktické informace</a>
      </div>
      <p class="match-updated">Aktualizováno ${escapeHtml(formatUpdatedDate(data.updatedAt))}</p>`;

    detailsCard.className = "match-details-card anniversary-season-card event-details-card";
    detailsCard.innerHTML = `
      <img src="${escapeHtml(visual.image)}" alt="${escapeHtml(visual.imageAlt)}" width="${escapeHtml(visual.imageWidth)}" height="${escapeHtml(visual.imageHeight)}" loading="lazy">
      <div>
        <span>${escapeHtml(visual.label)}</span>
        <h3>${escapeHtml(visual.title)}</h3>
        <p>${escapeHtml(visual.text)}</p>
        <a href="${escapeHtml(visual.link)}">${escapeHtml(visual.linkLabel)}</a>
      </div>`;

    updateCountdown(start, {
      remainingLabel: "zahájení turnaje",
      liveText: "Turnaj právě začal nebo již probíhá."
    });
  };

  const renderPendingMatch = (card, detailsCard) => {
    card.className = "next-match-card is-pending";
    card.innerHTML = `
      <div class="match-card-topline">
        <span>Příští zápas</span>
        <span>Termín bude doplněn</span>
      </div>
      <div class="match-pending">
        <span aria-hidden="true">—</span>
        <div>
          <p>${escapeHtml(data.pending.kicker)}</p>
          <h3>${escapeHtml(data.pending.title)}</h3>
        </div>
        <span aria-hidden="true">—</span>
      </div>
      <p class="match-card-copy">${escapeHtml(data.pending.description)}</p>
      <div class="match-card-actions">
        <a class="button button-primary" href="souteze.html">Přehled soutěží</a>
        <a class="button button-ghost" href="${escapeHtml(data.pending.officialUrl)}" target="_blank" rel="noopener">Futsal Havířov ↗</a>
      </div>
      <p class="match-updated">Stav ověřen k ${escapeHtml(formatUpdatedDate(data.updatedAt))}</p>`;

    const visual = data.pending.visual;
    detailsCard.className = "match-details-card anniversary-season-card";
    detailsCard.innerHTML = `
      <img src="${escapeHtml(visual.image)}" alt="${escapeHtml(visual.imageAlt)}" width="900" height="900" loading="lazy">
      <div>
        <span>${escapeHtml(visual.label)}</span>
        <h3>${escapeHtml(visual.title)}</h3>
        <p>${escapeHtml(visual.text)}</p>
        <a href="${escapeHtml(visual.link)}">${escapeHtml(visual.linkLabel)}</a>
      </div>`;
  };

  const calendarTimestamp = (value) => parseDate(value)
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}Z$/, "Z");

  const calendarData = (match) => {
    const start = parseDate(match.start);
    const end = parseDate(match.end) || new Date(start.getTime() + 40 * 60 * 1000);
    const homeName = match.isHome ? data.team.name : match.opponent.name;
    const awayName = match.isHome ? match.opponent.name : data.team.name;
    const title = `${homeName} – ${awayName}`;
    const location = [match.venue?.name, match.venue?.address].filter(Boolean).join(", ");
    const description = [match.competition, match.round, match.note, match.officialUrl]
      .filter(Boolean)
      .join("\n");
    const escapeIcs = (value) => String(value)
      .replaceAll("\\", "\\\\")
      .replace(/([,;])/g, "\\$1")
      .replaceAll("\n", "\\n");
    const startStamp = calendarTimestamp(start);
    const endStamp = calendarTimestamp(end);
    const uidOpponent = match.opponent.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Invictus 2011//Zapasove centrum//CS",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${startStamp}-${uidOpponent}@invictus2011.cz`,
      `DTSTAMP:${calendarTimestamp(new Date())}`,
      `DTSTART:${startStamp}`,
      `DTEND:${endStamp}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(location)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const google = new URL("https://calendar.google.com/calendar/render");
    google.searchParams.set("action", "TEMPLATE");
    google.searchParams.set("text", title);
    google.searchParams.set("dates", `${startStamp}/${endStamp}`);
    google.searchParams.set("details", description);
    google.searchParams.set("location", location);

    return {
      icsUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
      googleUrl: google.toString()
    };
  };

  const updateCountdown = (start, options = {}) => {
    const target = document.querySelector("[data-match-countdown]");
    if (!target) return;
    const remainingLabel = options.remainingLabel || "utkání";
    const liveText = options.liveText || "Utkání právě začalo nebo již probíhá.";
    const units = {
      days: target.querySelector("[data-countdown-days]"),
      hours: target.querySelector("[data-countdown-hours]"),
      minutes: target.querySelector("[data-countdown-minutes]"),
      seconds: target.querySelector("[data-countdown-seconds]")
    };
    const accessible = target.querySelector("[data-countdown-accessible]");
    let lastAccessibleMinute = null;

    const tick = () => {
      const difference = start.getTime() - Date.now();
      if (difference <= 0) {
        Object.values(units).forEach((element) => { element.textContent = "00"; });
        accessible.textContent = liveText;
        return false;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      units.days.textContent = String(days).padStart(2, "0");
      units.hours.textContent = String(hours).padStart(2, "0");
      units.minutes.textContent = String(minutes).padStart(2, "0");
      units.seconds.textContent = String(seconds).padStart(2, "0");

      if (lastAccessibleMinute !== totalSeconds - seconds) {
        accessible.textContent = `Do ${remainingLabel} zbývá ${days} dní, ${hours} hodin a ${minutes} minut.`;
        lastAccessibleMinute = totalSeconds - seconds;
      }
      return true;
    };

    if (tick()) {
      const interval = window.setInterval(() => {
        if (!tick()) window.clearInterval(interval);
      }, 1000);
    }
  };

  const renderScheduledMatch = (card, detailsCard, match) => {
    const start = parseDate(match.start);
    const calendar = calendarData(match);
    const invictusRole = match.isHome ? "Domácí" : "Hosté";
    const opponentRole = match.isHome ? "Hosté" : "Domácí";
    const round = match.round || match.competition;

    card.className = "next-match-card has-match";
    card.innerHTML = `
      <div class="match-card-topline">
        <span>Příští zápas</span>
        <span>${escapeHtml(formatDateTime(match.start))}</span>
      </div>
      <div class="next-match-showdown">
        <div class="next-match-team">
          ${logoMarkup(data.team, true)}
          <span>${escapeHtml(invictusRole)}</span>
          <h3>${escapeHtml(data.team.name)}</h3>
        </div>
        <div class="next-match-versus">
          <strong>VS</strong>
          <span>${escapeHtml(round)}</span>
        </div>
        <div class="next-match-team">
          ${logoMarkup(match.opponent, true)}
          <span>${escapeHtml(opponentRole)}</span>
          <h3>${escapeHtml(match.opponent.name)}</h3>
        </div>
      </div>
      <div class="match-countdown" data-match-countdown aria-label="Odpočet do utkání">
        <div><strong data-countdown-days>--</strong><span>dní</span></div>
        <div><strong data-countdown-hours>--</strong><span>hodin</span></div>
        <div><strong data-countdown-minutes>--</strong><span>minut</span></div>
        <div><strong data-countdown-seconds>--</strong><span>sekund</span></div>
        <p class="sr-only" data-countdown-accessible aria-live="polite"></p>
      </div>
      ${match.note ? `<p class="match-card-copy">${escapeHtml(match.note)}</p>` : ""}
      <div class="match-card-actions">
        <a class="button button-primary" href="${calendar.icsUrl}" download="invictus-pristi-zapas.ics">Přidat do kalendáře</a>
        <a class="button button-ghost" href="${escapeHtml(calendar.googleUrl)}" target="_blank" rel="noopener">Google kalendář ↗</a>
      </div>
      <p class="match-updated">Aktualizováno ${escapeHtml(formatUpdatedDate(data.updatedAt))}</p>`;

    const venue = match.venue || {};
    let map;
    if (venue.mapEmbedUrl) {
      map = `<iframe class="match-venue-map" src="${escapeHtml(venue.mapEmbedUrl)}" title="Mapa místa utkání" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    } else if (venue.mapUrl) {
      map = `<a class="match-map-link" href="${escapeHtml(venue.mapUrl)}" target="_blank" rel="noopener" aria-label="Otevřít místo utkání v mapě"><div class="match-map-placeholder"><span aria-hidden="true">⌖</span><strong>Mapa haly</strong></div></a>`;
    } else {
      map = '<div class="match-map-placeholder"><span aria-hidden="true">⌖</span><strong>Mapa bude doplněna</strong></div>';
    }

    detailsCard.className = "match-details-card match-venue-card";
    detailsCard.innerHTML = `
      <div class="match-venue-copy">
        <span>Místo utkání</span>
        <h3>${escapeHtml(venue.name || "Hala bude doplněna")}</h3>
        <p>${escapeHtml(venue.address || "Adresu zveřejníme společně s oficiálním rozpisem.")}</p>
        <dl>
          <div><dt>Termín</dt><dd>${escapeHtml(formatDateTime(match.start))}</dd></div>
          <div><dt>Soutěž</dt><dd>${escapeHtml(match.competition)}</dd></div>
        </dl>
      </div>
      ${map}
      <div class="match-venue-actions">
        ${venue.mapUrl ? `<a class="button button-primary" href="${escapeHtml(venue.mapUrl)}" target="_blank" rel="noopener">Otevřít mapu ↗</a>` : ""}
        ${match.officialUrl ? `<a class="button button-ghost" href="${escapeHtml(match.officialUrl)}" target="_blank" rel="noopener">Detail utkání ↗</a>` : ""}
      </div>`;

    updateCountdown(start);
  };

  const renderNextMatch = () => {
    const card = document.querySelector("[data-next-match-card]");
    const detailsCard = document.querySelector("[data-match-details-card]");
    if (!card || !detailsCard) return;

    const match = data.nextMatch;
    if (match && parseDate(match.start)) {
      renderScheduledMatch(card, detailsCard, match);
      return;
    }

    const event = getFeaturedEvent();
    if (event) {
      renderFeaturedEvent(card, detailsCard, event);
      return;
    }

    renderPendingMatch(card, detailsCard);
  };

  const featuredTeamMarkup = (team, role) => `
    <div class="featured-team">
      ${logoMarkup(team, true)}
      <h3>${escapeHtml(team.name)}</h3>
      <span>${escapeHtml(role)}</span>
    </div>`;

  const renderFeaturedResult = (result) => {
    const state = resultState(result);
    const home = result.isHome ? data.team : result.opponent;
    const away = result.isHome ? result.opponent : data.team;
    const homeScore = result.isHome ? result.invictusScore : result.opponentScore;
    const awayScore = result.isHome ? result.opponentScore : result.invictusScore;

    return `
      <article class="featured-result-card ${state.className}">
        <div class="featured-result-topline">
          <span>Nejnovější utkání</span>
          <time datetime="${escapeHtml(result.start)}">${escapeHtml(formatDateTime(result.start))}</time>
        </div>
        <div class="featured-result">
          ${featuredTeamMarkup(home, "Domácí")}
          <div class="featured-score">
            <span class="result-label ${state.className}">${state.label}</span>
            <strong>
              <span class="sr-only">${escapeHtml(home.name)} ${homeScore}, ${escapeHtml(away.name)} ${awayScore}</span>
              <span aria-hidden="true">${homeScore}</span><i aria-hidden="true">:</i><span aria-hidden="true">${awayScore}</span>
            </strong>
            <p>${escapeHtml(result.competition)}</p>
          </div>
          ${featuredTeamMarkup(away, "Hosté")}
        </div>
        ${result.note ? `<p class="featured-result-note">${escapeHtml(result.note)}</p>` : ""}
      </article>`;
  };

  const renderResultRow = (result) => {
    const state = resultState(result);
    return `
      <article class="recent-result-row ${state.className}">
        <time datetime="${escapeHtml(result.start)}"><strong>${escapeHtml(formatShortDate(result.start))}</strong><span>${escapeHtml(formatTime(result.start))}</span></time>
        ${logoMarkup(result.opponent)}
        <div class="recent-opponent">
          <span>${result.isHome ? "Doma" : "Venku"}</span>
          <h3>${escapeHtml(result.opponent.name)}</h3>
        </div>
        <span class="result-label ${state.className}">${state.label}</span>
        <strong class="recent-score">
          <span class="sr-only">Invictus 2011 ${result.invictusScore}, ${escapeHtml(result.opponent.name)} ${result.opponentScore}</span>
          <span aria-hidden="true">${result.invictusScore}<i>:</i>${result.opponentScore}</span>
        </strong>
      </article>`;
  };

  const renderRecentResults = () => {
    const target = document.querySelector("[data-recent-results]");
    if (!target) return;
    const results = data.recentResults.slice(0, 5);
    if (!results.length) {
      target.innerHTML = '<p class="match-center-empty">Výsledky budou doplněny po prvních utkáních.</p>';
      return;
    }

    const balance = results.reduce((total, result) => ({
      scored: total.scored + result.invictusScore,
      conceded: total.conceded + result.opponentScore
    }), { scored: 0, conceded: 0 });
    const form = results.map(resultState);
    const formDescription = form.map((state) => state.label.toLowerCase()).join(", ");

    target.innerHTML = `
      <header class="recent-results-head">
        <div>
          <p class="eyebrow">${escapeHtml(data.recentResultsTitle)}</p>
          <h2 id="recent-results-title">Posledních <em>pět.</em></h2>
        </div>
        <div class="recent-form-summary">
          <div>
            <span>Aktuální forma</span>
            <ol class="form-sequence" aria-label="Od nejnovějšího zápasu: ${escapeHtml(formDescription)}">
              ${form.map((state) => `<li class="${state.className}"><abbr title="${state.label}">${state.short}</abbr></li>`).join("")}
            </ol>
          </div>
          <div class="recent-goal-balance">
            <span>Skóre</span>
            <strong>${balance.scored}:${balance.conceded}</strong>
          </div>
        </div>
      </header>
      <div class="recent-results-layout">
        ${renderFeaturedResult(results[0])}
        <div class="recent-result-list">
          <div class="recent-result-list-head">
            <span>Čtyři předchozí zápasy</span>
            <small>Skóre z pohledu Invictu</small>
          </div>
          ${results.slice(1).map(renderResultRow).join("")}
        </div>
      </div>
      <div class="recent-results-footer">
        <p>Výsledky ověřeny ve <a href="${escapeHtml(data.resultsSourceUrl)}" target="_blank" rel="noopener">veřejné databázi Futsalu Havířov</a> · ${escapeHtml(formatUpdatedDate(data.resultsUpdatedAt))}</p>
        <a href="${escapeHtml(data.seasonArchiveUrl)}">Celá sezona 2025/26 →</a>
      </div>`;
  };

  const renderMatchCenter = () => {
    const season = document.querySelector("[data-match-center-season]");
    if (season) season.textContent = data.season;
    renderStatus();
    renderNextMatch();
    renderRecentResults();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderMatchCenter, { once: true });
  } else {
    renderMatchCenter();
  }
})();
