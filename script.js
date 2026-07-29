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
  info.innerHTML = `<div class="player-role"><span class="player-number">${formatJerseyNumber(player.number)}</span><span class="player-position">${player.position}</span></div><h3>${player.name}</h3>`;
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

const galleryLightbox = document.querySelector("#gallery-lightbox");
const galleryLightboxImage = document.querySelector("#gallery-lightbox-image");
const galleryLightboxCaption = document.querySelector("#gallery-lightbox-caption");
const galleryLightboxCount = document.querySelector("#gallery-lightbox-count");
const galleryLightboxClose = galleryLightbox.querySelector(".gallery-lightbox-close");
const galleryLightboxPrevious = galleryLightbox.querySelector(".gallery-lightbox-prev");
const galleryLightboxNext = galleryLightbox.querySelector(".gallery-lightbox-next");
const galleryButtons = [...document.querySelectorAll(".gallery-open")];
let activeGalleryIndex = 0;
let lastGalleryTrigger = null;

function showGalleryImage(index) {
  activeGalleryIndex = (index + galleryButtons.length) % galleryButtons.length;
  const button = galleryButtons[activeGalleryIndex];
  const figure = button.closest(".gallery-item");
  const image = button.querySelector("img");
  const label = figure.querySelector("figcaption span")?.textContent.trim();
  const description = figure.querySelector("figcaption p")?.textContent.trim() || image.alt;

  galleryLightboxImage.src = image.currentSrc || image.src;
  galleryLightboxImage.alt = image.alt;
  galleryLightboxCaption.textContent = label ? `${label} — ${description}` : description;
  galleryLightboxCount.textContent = `${activeGalleryIndex + 1} / ${galleryButtons.length}`;
}

function openGalleryImage(index, trigger) {
  lastGalleryTrigger = trigger;
  showGalleryImage(index);
  galleryLightbox.showModal();
  document.body.classList.add("modal-open");
  galleryLightboxClose.focus();
}

function closeGalleryImage(restoreFocus = true) {
  if (!galleryLightbox.open) return;
  galleryLightbox.close();
  document.body.classList.remove("modal-open");
  if (restoreFocus) lastGalleryTrigger?.focus();
  lastGalleryTrigger = null;
}

galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => openGalleryImage(index, button));
});
galleryLightboxClose.addEventListener("click", () => closeGalleryImage());
galleryLightboxPrevious.addEventListener("click", () => showGalleryImage(activeGalleryIndex - 1));
galleryLightboxNext.addEventListener("click", () => showGalleryImage(activeGalleryIndex + 1));
galleryLightbox.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) closeGalleryImage();
});
galleryLightbox.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeGalleryImage();
});
galleryLightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showGalleryImage(activeGalleryIndex - 1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showGalleryImage(activeGalleryIndex + 1);
  }
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

const routeByHash = new Map([
  ["", "home"],
  ["#top", "home"],
  ["#sezona", "home"],
  ["#novinky", "news"],
  ["#klub", "club"],
  ["#rekordy", "club"],
  ["#historie", "history"],
  ["#soupiska", "roster"],
  ["#galerie", "gallery"],
  ["#instagram", "instagram"],
  ["#kontakt", "contact"],
]);
const viewTitles = {
  home: "Invictus 2011 – futsalový klub Havířov | Oficiální web",
  news: "Novinky | Invictus 2011",
  club: "O klubu | Invictus 2011",
  history: "Historie | Invictus 2011",
  roster: "Soupiska | Invictus 2011",
  gallery: "Galerie | Invictus 2011",
  instagram: "Instagram | Invictus 2011",
  contact: "Kontakt | Invictus 2011",
};
const viewSections = [...document.querySelectorAll("[data-view]")];
let instagramScriptLoading = false;

function loadInstagramEmbeds() {
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
    return;
  }
  if (instagramScriptLoading || document.querySelector("script[data-instagram-embed]")) return;

  instagramScriptLoading = true;
  const instagramScript = document.createElement("script");
  instagramScript.src = "https://www.instagram.com/embed.js";
  instagramScript.async = true;
  instagramScript.dataset.instagramEmbed = "";
  instagramScript.addEventListener("load", () => {
    instagramScriptLoading = false;
    window.instgrm?.Embeds?.process();
  });
  instagramScript.addEventListener("error", () => {
    instagramScriptLoading = false;
    instagramScript.remove();
  });
  document.body.append(instagramScript);
}


const instagramFeed = document.querySelector("[data-instagram-feed]");
const instagramStatus = document.querySelector("[data-instagram-status]");
const instagramUpdated = document.querySelector("[data-instagram-updated]");
let instagramFeedPromise = null;

function isOfficialInstagramPermalink(value) {
  try {
    const url = new URL(value);
    return (url.hostname === "www.instagram.com" || url.hostname === "instagram.com")
      && /^\/(?:p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

function getInstagramCardLabel(mediaType, index) {
  const labels = {
    VIDEO: "Reel",
    REELS: "Reel",
    CAROUSEL_ALBUM: "Galerie",
    IMAGE: "Příspěvek",
  };
  return labels[mediaType] || `Příspěvek ${index + 1}`;
}

function formatInstagramUpdatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function renderInstagramFeed(items) {
  const fragment = document.createDocumentFragment();
  items.slice(0, 5).forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "instagram-card";

    const label = document.createElement("span");
    label.className = "instagram-card-label";
    label.textContent = getInstagramCardLabel(item.media_type, index);

    const embed = document.createElement("blockquote");
    embed.className = "instagram-media";
    embed.dataset.instgrmPermalink = item.permalink;
    embed.dataset.instgrmVersion = "14";

    const link = document.createElement("a");
    link.href = item.permalink;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = `Zobrazit ${label.textContent.toLowerCase()} na Instagramu ↗`;

    embed.append(link);
    article.append(label, embed);
    fragment.append(article);
  });

  instagramFeed.replaceChildren(fragment);
}

async function loadInstagramFeed() {
  if (instagramFeedPromise) {
    await instagramFeedPromise;
    loadInstagramEmbeds();
    return;
  }

  instagramFeedPromise = (async () => {
    instagramFeed.setAttribute("aria-busy", "true");

    try {
      const cacheHour = Math.floor(Date.now() / 3600000);
      const response = await fetch(`instagram-feed.json?v=${cacheHour}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Instagram feed: ${response.status}`);

      const data = await response.json();
      const items = Array.isArray(data.items)
        ? data.items.filter((item) => isOfficialInstagramPermalink(item?.permalink)).slice(0, 5)
        : [];
      if (!items.length) throw new Error("Instagram feed neobsahuje platné příspěvky.");

      renderInstagramFeed(items);
      const automatic = data.source === "instagram-api";
      instagramStatus.textContent = automatic
        ? "Automatická aktualizace je aktivní"
        : "Zobrazen poslední uložený výběr";
      const formattedDate = formatInstagramUpdatedAt(data.updated_at);
      instagramUpdated.textContent = formattedDate ? `Aktualizováno ${formattedDate}` : "";
      instagramUpdated.dateTime = data.updated_at || "";
      document.querySelector(".instagram-live")?.classList.toggle("is-fallback", !automatic);
    } catch (error) {
      instagramStatus.textContent = "Zobrazen poslední uložený výběr";
      instagramUpdated.textContent = "Instagram je momentálně nedostupný";
      document.querySelector(".instagram-live")?.classList.add("is-fallback");
      console.warn(error);
    } finally {
      instagramFeed.setAttribute("aria-busy", "false");
      loadInstagramEmbeds();
    }
  })();

  await instagramFeedPromise;
}

function getRequestedView() {
  if (window.location.hash === "#obsah") {
    return document.body.dataset.currentView || "home";
  }
  return routeByHash.get(window.location.hash) || "home";
}

function renderView() {
  const requestedView = getRequestedView();
  viewSections.forEach((section) => {
    section.hidden = section.dataset.view !== requestedView;
  });
  document.body.dataset.currentView = requestedView;
  document.title = viewTitles[requestedView];

  if (requestedView === "instagram") {
    window.requestAnimationFrame(loadInstagramFeed);
  }

  nav.querySelectorAll("a").forEach((link) => {
    const linkView = routeByHash.get(link.getAttribute("href"));
    if (linkView === requestedView) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  if (requestedView !== "roster" && modal.open) {
    modal.close();
    document.body.classList.remove("modal-open");
    lastPlayerTrigger = null;
  }
  if (requestedView !== "gallery" && galleryLightbox.open) {
    closeGalleryImage(false);
  }

  window.requestAnimationFrame(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#top") {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const target = document.getElementById(hash.slice(1));
    if (target && !target.hidden) {
      target.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  });
}

window.addEventListener("hashchange", renderView);
document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (routeByHash.has(href) && href === window.location.hash) {
    event.preventDefault();
    renderView();
  }
});
renderView();

document.querySelector("#year").textContent = new Date().getFullYear();
