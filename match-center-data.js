/*
 * Jediný zdroj údajů pro zápasové centrum.
 * Po zveřejnění rozpisu stačí doplnit objekt nextMatch; odpočet, mapa
 * a odkazy do kalendáře se na webu aktivují automaticky.
 */
window.MATCH_CENTER_DATA = {
  season: "2026/27",
  updatedAt: "2026-08-10",
  team: {
    name: "Invictus 2011",
    logo: "assets/logo-invictus-2011.webp"
  },
  status: {
    label: "Před sezonou",
    text: "Čekáme na oficiální rozpis soutěží."
  },
  featuredEvent: {
    statusLabel: "Nejbližší klubová událost",
    start: "2026-08-15T09:20:00+02:00",
    expiresAt: "2026-08-16T00:00:00+02:00",
    kicker: "První ročník · pět týmů",
    title: "INVICUP 2026",
    description: "Sraz všech týmů je v 9:00. První zápas turnaje INVICUP začne v sobotu 15. srpna v 9:20 na hřišti u ZŠ Gorkého v Havířově.",
    location: "ZŠ Gorkého · Havířov",
    format: "Každý s každým · 2×10 minut",
    detailUrl: "invi-cup-2026.html",
    detailLabel: "Detail turnaje",
    visual: {
      image: "assets/news/invi-cup-2026.svg",
      imageAlt: "Plakát prvního ročníku futsalového turnaje INVICUP 2026",
      imageWidth: 1003,
      imageHeight: 1568,
      label: "Sraz 9:00 · první výkop 9:20",
      title: "První INVICUP. První vítěz.",
      text: "Pět týmů se utká systémem každý s každým o putovní pohár.",
      link: "invi-cup-2026.html",
      linkLabel: "Všechny informace →"
    }
  },
  pending: {
    kicker: "Jubilejní sezona",
    title: "Čekáme na první výkop",
    description: "Havířovská futsalová liga přijímá přihlášky do 6. září 2026. Soupeře, datum, čas i místo prvního utkání doplníme bezprostředně po zveřejnění oficiálního programu.",
    deadline: "2026-09-06",
    officialUrl: "https://www.futsalhavirov.cz/",
    visual: {
      image: "assets/history/vyrocni-logo-invictus-15-let-2026-2027.webp",
      imageAlt: "Výroční logo Invictus 2011 pro sezonu 2026/2027",
      label: "15 let klubu",
      title: "Jedna sezona. Výjimečný znak.",
      text: "Speciální zlaté logo bude klub provázet pouze jubilejním ročníkem 2026/2027.",
      link: "historie.html",
      linkLabel: "Příběh výročního loga →"
    }
  },

  /*
   * Příklad aktivního utkání:
   * nextMatch: {
   *   start: "2026-10-02T21:00:00+02:00",
   *   end: "2026-10-02T21:40:00+02:00",
   *   competition: "Havířovská futsalová liga",
   *   round: "1. kolo",
   *   isHome: true,
   *   opponent: { name: "Soupeř", logo: "assets/teams/souper.png" },
   *   venue: {
   *     name: "Sportovní hala Slavie",
   *     address: "Havířov",
   *     mapUrl: "https://maps.google.com/?q=...",
   *     mapEmbedUrl: "https://www.google.com/maps/embed?..."
   *   },
   *   officialUrl: "https://www.futsalhavirov.cz/",
   *   note: "První utkání jubilejní sezony."
   * }
   */
  nextMatch: null,

  recentResultsTitle: "Závěr sezony 2025/26",
  resultsUpdatedAt: "2026-07-26",
  resultsSourceUrl: "https://www.futsalhavirov.cz/klub/invictus-2011/",
  seasonArchiveUrl: "havirovska-liga.html",
  recentResults: [
    {
      start: "2026-04-03T22:20:00+02:00",
      competition: "HFL · skupina o udržení",
      isHome: true,
      opponent: {
        name: "Slovan Havířov",
        logo: "assets/teams/slovan-havirov.png"
      },
      invictusScore: 3,
      opponentScore: 2,
      note: "Ligovou sezonu uzavřel Invictus domácím vítězstvím nad Slovanem Havířov."
    },
    {
      start: "2026-04-03T21:00:00+02:00",
      competition: "HFL · skupina o udržení",
      isHome: false,
      opponent: {
        name: "Tinder Surprise",
        logo: "assets/teams/tinder-surprise.png"
      },
      invictusScore: 4,
      opponentScore: 6
    },
    {
      start: "2026-03-27T22:20:00+01:00",
      competition: "HFL · skupina o udržení",
      isHome: true,
      opponent: {
        name: "FK Slavoj Houfnice",
        logo: "assets/teams/fk-slavoj-houfnice.png"
      },
      invictusScore: 1,
      opponentScore: 3
    },
    {
      start: "2026-03-27T21:00:00+01:00",
      competition: "HFL · skupina o udržení",
      isHome: false,
      opponent: {
        name: "DYNAMO Šumbark",
        logo: "assets/teams/dynamo-sumbark.png"
      },
      invictusScore: 2,
      opponentScore: 1
    },
    {
      start: "2026-03-01T09:40:00+01:00",
      competition: "HFL · skupina o udržení",
      isHome: true,
      opponent: {
        name: "FO3 Havířov",
        logo: "assets/teams/fo3-havirov.png"
      },
      invictusScore: 0,
      opponentScore: 4
    }
  ]
};
