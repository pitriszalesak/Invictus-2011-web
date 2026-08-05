import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const OUTPUT_DIR = path.join(ROOT, "hraci");
const BASE_URL = "https://invictus2011.cz";
const GENERATED_MARKER = "<!-- GENERATED: player-profile -->";

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const loadPlayers = async () => {
  const source = await readFile(path.join(ROOT, "players-data.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source.replace(/^\uFEFF/, ""), sandbox, {
    filename: "players-data.js"
  });
  return {
    players: Array.isArray(sandbox.window.playersData) ? sandbox.window.playersData : [],
    updatedAt: sandbox.window.playersDataUpdatedAt || null
  };
};

const positionOrder = new Map([
  ["Brankář", 0],
  ["Obránce", 1],
  ["Útočník", 2]
]);
const collator = new Intl.Collator("cs", { sensitivity: "base" });
const surname = (name) => name.trim().split(/\s+/).at(-1);

const sortPlayers = (players) => players
  .filter((player) => !player.hidden)
  .sort((a, b) => {
    const positionDifference = (positionOrder.get(a.position) ?? 99)
      - (positionOrder.get(b.position) ?? 99);
    return positionDifference
      || collator.compare(surname(a.name), surname(b.name))
      || collator.compare(a.name, b.name);
  });

const formatNumber = (number) => Number.isInteger(number) ? `#${number}` : "—";

const formatUpdatedAt = (value) => {
  if (!value) return "neuvedeno";
  const [year, month, day] = value.split("-");
  return `${Number(day)}. ${Number(month)}. ${year}`;
};

const birthDateIso = (value) => {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value || "");
  if (!match) return null;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
};

const initials = (name) => name
  .split(/\s+/)
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

const playerImage = (player) => player.image
  ? `../assets/players/${escapeHtml(player.image)}`
  : null;

const absolutePlayerImage = (player) => player.image
  ? `${BASE_URL}/assets/players/${encodeURIComponent(player.image)}`
  : `${BASE_URL}/assets/hero-team-invictus-2026.jpg`;

const biographyMarkup = (player) => {
  const paragraphs = Array.isArray(player.bio) ? player.bio.filter(Boolean) : [];
  if (!paragraphs.length) return "";
  return `
        <section class="player-profile-story" aria-labelledby="player-story-title">
          <p class="eyebrow">Příběh hráče</p>
          <h2 id="player-story-title">V dresu Invictu.</h2>
          ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n          ")}
        </section>`;
};

const seasonRows = (player) => (Array.isArray(player.breakdown) ? player.breakdown : [])
  .map((season) => `
                <tr>
                  <td>${escapeHtml(season.season)}</td>
                  <th scope="row">${escapeHtml(season.team)}</th>
                  <td>${Number(season.matches) || 0}</td>
                  <td>${Number(season.goals) || 0}</td>
                  <td>${Number(season.yellow) || 0}</td>
                  <td>${Number(season.red) || 0}</td>
                </tr>`)
  .join("");

const profileNavigation = (players, index) => {
  const previous = players[(index - 1 + players.length) % players.length];
  const next = players[(index + 1) % players.length];
  return `
        <nav class="player-profile-navigation" aria-label="Další hráčské profily">
          <a href="${escapeHtml(previous.slug)}.html">
            <span>← Předchozí hráč</span>
            <strong>${escapeHtml(previous.name)}</strong>
          </a>
          <a href="${escapeHtml(next.slug)}.html">
            <span>Další hráč →</span>
            <strong>${escapeHtml(next.name)}</strong>
          </a>
        </nav>`;
};

const profilePage = (player, players, index, updatedAt) => {
  const url = `${BASE_URL}/hraci/${player.slug}.html`;
  const image = absolutePlayerImage(player);
  const description = `${player.name} – ${player.position.toLowerCase()} futsalového klubu Invictus 2011. ${player.matches} zápasů a ${player.goals} gólů v dostupné evidenci Futsalu Havířov.`;
  const nameParts = player.name.trim().split(/\s+/);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: player.name,
    givenName: nameParts.slice(0, -1).join(" "),
    familyName: nameParts.at(-1),
    url,
    image,
    birthDate: birthDateIso(player.birth),
    memberOf: {
      "@type": "SportsTeam",
      name: "Invictus 2011",
      url: BASE_URL
    },
    sameAs: player.profile ? [player.profile] : []
  };
  Object.keys(schema).forEach((key) => {
    if (schema[key] === null || schema[key] === "" || (Array.isArray(schema[key]) && !schema[key].length)) {
      delete schema[key];
    }
  });
  const portrait = playerImage(player)
    ? `<img src="${playerImage(player)}" alt="${escapeHtml(player.name)} – ${escapeHtml(player.position.toLowerCase())} Invictus 2011" width="1024" height="1400">`
    : `<span aria-hidden="true">${escapeHtml(player.initials || initials(player.name))}</span>`;

  return `${GENERATED_MARKER}
<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="theme-color" content="#090909">
  <meta property="og:type" content="profile">
  <meta property="og:locale" content="cs_CZ">
  <meta property="og:site_name" content="Invictus 2011">
  <meta property="og:title" content="${escapeHtml(player.name)} | Invictus 2011">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="1400">
  <meta property="og:image:alt" content="${escapeHtml(player.name)} – Invictus 2011">
  <meta property="profile:first_name" content="${escapeHtml(nameParts.slice(0, -1).join(" "))}">
  <meta property="profile:last_name" content="${escapeHtml(nameParts.at(-1))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(player.name)} | Invictus 2011">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <link rel="canonical" href="${url}">
  <title>${escapeHtml(player.name)} | Hráč Invictus 2011</title>
  <link rel="icon" href="../favicon.ico?v=orlice-20260726" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png?v=orlice-20260726">
  <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png?v=orlice-20260726">
  <link rel="stylesheet" href="../style.css">
  <script type="application/ld+json">${JSON.stringify(schema).replaceAll("<", "\\u003c")}</script>
</head>
<body class="standalone-section-page player-profile-page">
  <a class="skip-link" href="#obsah">Přejít na obsah</a>
  <header class="site-header" id="top">
    <a class="brand" href="../index.html" aria-label="Invictus 2011 – úvod">
      <img src="../assets/logo-invictus-2011.webp" alt="" width="72" height="53">
      <span>Invictus <b>2011</b></span>
    </a>
    <button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav">
      <span></span><span></span><span></span>
      <span class="sr-only">Otevřít menu</span>
    </button>
    <nav id="main-nav" aria-label="Hlavní navigace">
      <a href="../index.html#sezona">Sezona 26/27</a>
      <a href="../novinky.html">Novinky</a>
      <a href="../index.html#klub">O klubu</a>
      <a href="../historie.html">Historie</a>
      <a href="../soupiska.html" aria-current="page">Soupiska</a>
      <a href="../souteze.html">Soutěže</a>
      <a href="../galerie.html">Galerie</a>
      <a href="../index.html#instagram">Instagram</a>
      <a href="../index.html#kontakt">Kontakt</a>
    </nav>
  </header>

  <main id="obsah" class="player-profile-main">
    <a class="player-profile-back" href="../soupiska.html">← Zpět na soupisku</a>
    <article class="player-profile" aria-labelledby="player-name">
      <div class="player-profile-hero">
        <figure class="player-profile-photo${player.image ? "" : " is-missing"}">
          ${portrait}
        </figure>
        <div class="player-profile-overview">
          <p class="eyebrow">Hráčský profil · Invictus 2011</p>
          <div class="player-profile-role">
            <span>${escapeHtml(formatNumber(player.number))}</span>
            <strong>${escapeHtml(player.position)}</strong>
          </div>
          <h1 id="player-name">${escapeHtml(player.name)}</h1>
          <p class="player-profile-born">Narozen <strong>${escapeHtml(player.birth || "neuvedeno")}</strong></p>
          <div class="player-profile-stats" role="group" aria-label="Statistiky hráče ${escapeHtml(player.name)}">
            <div><strong>${Number(player.matches) || 0}</strong><span>Zápasy</span></div>
            <div><strong>${Number(player.goals) || 0}</strong><span>Góly</span></div>
            <div><strong>${Number(player.yellow) || 0}</strong><span>Žluté karty</span></div>
            <div><strong>${Number(player.red) || 0}</strong><span>Červené karty</span></div>
          </div>
          <div class="player-profile-actions">
            <button class="button button-primary" type="button" data-share-profile data-share-text="Hráčský profil ${escapeHtml(player.name)} – Invictus 2011">Sdílet profil</button>
            ${player.profile ? `<a class="button button-outline" href="${escapeHtml(player.profile)}" target="_blank" rel="noopener">Profil na Futsal Havířov ↗</a>` : ""}
          </div>
        </div>
      </div>

      <div class="player-profile-content">
        ${biographyMarkup(player)}
        <section class="player-profile-seasons" aria-labelledby="player-seasons-title">
          <div class="player-profile-section-head">
            <div>
              <p class="eyebrow">Dostupná evidence</p>
              <h2 id="player-seasons-title">Sezona po sezoně.</h2>
            </div>
            <p>Individuální statistiky z veřejné databáze Futsalu Havířov.</p>
          </div>
          <div class="season-table-wrap">
            <table class="season-table">
              <caption class="sr-only">Statistiky hráče ${escapeHtml(player.name)} podle sezon</caption>
              <thead><tr><th>Sezona</th><th>Klub</th><th>Z</th><th>G</th><th>ŽK</th><th>ČK</th></tr></thead>
              <tbody>${seasonRows(player)}
              </tbody>
            </table>
          </div>
          <p class="player-profile-note">Statistiky zahrnují pouze dohledané ročníky ve veřejné databázi Futsalu Havířov. Aktualizováno ${escapeHtml(formatUpdatedAt(updatedAt))}.</p>
        </section>

        ${profileNavigation(players, index)}
      </div>
    </article>
  </main>

  <footer>
    <a class="footer-brand" href="../index.html"><img src="../assets/logo-invictus-2011.webp" alt="" width="110" height="81"><span>Invictus 2011</span></a>
    <a class="footer-instagram" href="https://www.instagram.com/futsalinvictus2011/" target="_blank" rel="noopener">@futsalinvictus2011 ↗</a>
    <p>Amicitia · Virtus · Invictus</p>
    <p>© <span id="year"></span> Invictus 2011</p>
  </footer>
  <script src="../player-profile.js"></script>
  <script src="../page.js"></script>
</body>
</html>
`;
};

const main = async () => {
  const { players: allPlayers, updatedAt } = await loadPlayers();
  const players = sortPlayers(allPlayers);
  await mkdir(OUTPUT_DIR, { recursive: true });
  const expected = new Set(players.map((player) => `${player.slug}.html`));

  for (const player of players) {
    if (!/^[a-z0-9-]+$/.test(player.slug || "")) {
      throw new Error(`Neplatný slug hráče ${player.name}: ${player.slug}`);
    }
    if (!player.name || !player.position) {
      throw new Error(`Neúplná data hráče: ${player.slug}`);
    }
    const index = players.indexOf(player);
    const output = path.join(OUTPUT_DIR, `${player.slug}.html`);
    await writeFile(output, profilePage(player, players, index, updatedAt), "utf8");
  }

  for (const filename of await readdir(OUTPUT_DIR)) {
    if (!filename.endsWith(".html") || expected.has(filename)) continue;
    const stalePath = path.join(OUTPUT_DIR, filename);
    const content = await readFile(stalePath, "utf8");
    if (content.includes(GENERATED_MARKER)) await unlink(stalePath);
  }

  console.log(`Vygenerováno ${players.length} veřejných hráčských profilů.`);
};

await main();
