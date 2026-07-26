const players = window.playersData || [];

const grid = document.querySelector("#player-grid");
players.forEach((player) => {
  const card = document.createElement("article");
  card.className = `player-card${player.image ? "" : " missing"}`;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
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
  info.innerHTML = `<span class="player-number">${String(player.number).padStart(2, "0")}</span><h3>${player.name}</h3>`;
  card.append(info);
  card.addEventListener("click", () => openPlayer(player, card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPlayer(player, card);
    }
  });
  grid.append(card);
});

const modal = document.querySelector("#player-modal");
const modalClose = modal.querySelector(".modal-close");
let lastPlayerTrigger = null;

function openPlayer(player, trigger) {
  lastPlayerTrigger = trigger;
  document.querySelector("#modal-player-number").textContent = String(player.number).padStart(2, "0");
  document.querySelector("#modal-player-name").textContent = player.name;
  document.querySelector("#modal-player-birth").textContent = player.birth || "Neuvedeno";
  document.querySelector("#modal-matches").textContent = player.matches;
  document.querySelector("#modal-goals").textContent = player.goals;
  document.querySelector("#modal-yellow").textContent = player.yellow;
  document.querySelector("#modal-red").textContent = player.red;
  document.querySelector("#modal-source").href = player.profile;

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

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#main-nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

document.querySelector("#year").textContent = new Date().getFullYear();
