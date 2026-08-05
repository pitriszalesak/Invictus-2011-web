const players = window.playersData || [];

function formatJerseyNumber(number) {
  return Number.isInteger(number) ? `#${number}` : "—";
}

const positionOrder = new Map([
  ["Brankář", 0],
  ["Obránce", 1],
  ["Útočník", 2],
]);
const czechCollator = new Intl.Collator("cs", { sensitivity: "base" });

function getSurname(name) {
  const nameParts = name.trim().split(/\s+/);
  return nameParts[nameParts.length - 1];
}

const sortedPlayers = players.filter((player) => !player.hidden).sort((playerA, playerB) => {
  const positionDifference = (positionOrder.get(playerA.position) ?? positionOrder.size)
    - (positionOrder.get(playerB.position) ?? positionOrder.size);
  if (positionDifference) return positionDifference;

  const surnameDifference = czechCollator.compare(getSurname(playerA.name), getSurname(playerB.name));
  return surnameDifference || czechCollator.compare(playerA.name, playerB.name);
});

const grid = document.querySelector("#player-grid");
sortedPlayers.forEach((player) => {
  const card = document.createElement("a");
  card.className = `player-card${player.image ? "" : " missing"}`;
  card.href = `hraci/${player.slug}.html`;
  card.setAttribute("aria-label", `Otevřít profil hráče ${player.name}`);
  if (!player.image) card.dataset.initials = player.initials;

  if (player.image) {
    const image = document.createElement("img");
    image.src = `assets/players/${player.image}`;
    image.alt = `Profilová fotografie – ${player.name}`;
    image.loading = "lazy";
    image.width = 1024;
    image.height = 1400;
    card.append(image);
  }

  const info = document.createElement("div");
  info.className = "player-info";
  info.innerHTML = `<div class="player-role"><span class="player-number">${formatJerseyNumber(player.number)}</span><span class="player-position">${player.position}</span></div><h3>${player.name}</h3>`;
  card.append(info);
  grid.append(card);
});

const modal = document.querySelector("#player-modal");
const modalClose = modal.querySelector(".modal-close");
let lastPlayerTrigger = null;

function openPlayer(player, trigger) {
  lastPlayerTrigger = trigger;
  document.querySelector("#modal-player-number").textContent = formatJerseyNumber(player.number);
  document.querySelector("#modal-player-position").textContent = player.position;
  document.querySelector("#modal-player-name").textContent = player.name;
  document.querySelector("#modal-player-birth").textContent = player.birth || "Neuvedeno";
  document.querySelector("#modal-matches").textContent = player.matches;
  document.querySelector("#modal-goals").textContent = player.goals;
  document.querySelector("#modal-yellow").textContent = player.yellow;
  document.querySelector("#modal-red").textContent = player.red;
  document.querySelector("#modal-source").href = player.profile;

  const biography = document.querySelector("#modal-player-biography");
  const biographyContent = document.querySelector("#modal-player-bio");
  const biographyParagraphs = Array.isArray(player.bio) ? player.bio : [];
  biographyContent.replaceChildren();
  biography.hidden = biographyParagraphs.length === 0;
  biographyParagraphs.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    biographyContent.append(paragraph);
  });

  const portrait = document.querySelector("#modal-portrait");
  portrait.replaceChildren();
  portrait.classList.toggle("missing", !player.image);
  if (player.image) {
    const image = document.createElement("img");
    image.src = `assets/players/${player.image}`;
    image.alt = `Profilová fotografie – ${player.name}`;
    image.width = 1024;
    image.height = 1400;
    portrait.append(image);
  } else {
    portrait.textContent = player.initials;
  }

  const seasons = document.querySelector("#modal-seasons");
  seasons.replaceChildren();
  player.breakdown.forEach((season) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${season.season}</td><td>${season.team}</td><td>${season.matches}</td><td>${season.goals}</td><td>${season.yellow}</td><td>${season.red}</td>`;
    seasons.append(row);
  });

  modal.showModal();
  document.body.classList.add("modal-open");
  modalClose.focus();
}

function closePlayer() {
  modal.close();
  document.body.classList.remove("modal-open");
  lastPlayerTrigger?.focus();
}

modalClose.addEventListener("click", closePlayer);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closePlayer();
});
modal.addEventListener("cancel", (event) => {
  event.preventDefault();
  closePlayer();
});

const toggle = document.querySelector(".roster-toggle");
toggle.addEventListener("click", () => {
  const expanded = grid.classList.toggle("expanded");
  toggle.setAttribute("aria-expanded", String(expanded));
  toggle.textContent = expanded ? "Skrýt část soupisky" : "Zobrazit celou soupisku";
});
