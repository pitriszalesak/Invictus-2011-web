/*
 * Konečný rozpis a výsledky INVICUPU 2026.
 * Tým Lopata se turnaje nezúčastnil, proto není zahrnutý mezi účastníky
 * ani v odehraných zápasech. Křížová tabulka a pořadí se počítají automaticky.
 */
window.INVI_CUP_DATA = {
  updatedAt: "2026-08-15T14:38:36+02:00",
  scoring: {
    win: 3,
    draw: 1,
    loss: 0
  },
  teams: [
    { id: "invictus", name: "Invictus 2011", shortName: "Invictus", logo: "assets/logo-invictus-2011.png", logoType: "crest", seed: 1 },
    { id: "ludgerovice", name: "Ludgeřovice", shortName: "Ludgeřovice", logo: "assets/teams/ludgerovice.png?v=20260810-modern", logoType: "crest", seed: 3 },
    { id: "joga-bonito", name: "Joga Bonito", shortName: "Joga Bonito", logo: "assets/teams/joga-bonito.png?v=20260810-transparent", logoType: "crest", seed: 4 },
    { id: "slovan", name: "Slovan Havířov", shortName: "Slovan", logo: "assets/teams/slovan-havirov.png", logoType: "crest", seed: 2 }
  ],
  matches: [
    { number: 1, round: 1, start: "2026-08-15T09:20:00+02:00", home: "invictus", away: "ludgerovice", homeScore: 2, awayScore: 1 },
    { number: 2, round: 2, start: "2026-08-15T10:10:00+02:00", home: "ludgerovice", away: "slovan", homeScore: 0, awayScore: 5 },
    { number: 3, round: 2, start: "2026-08-15T10:35:00+02:00", home: "invictus", away: "joga-bonito", homeScore: 3, awayScore: 3 },
    { number: 4, round: 2, start: "2026-08-15T11:25:00+02:00", home: "joga-bonito", away: "ludgerovice", homeScore: 3, awayScore: 0 },
    { number: 5, round: 4, start: "2026-08-15T12:15:00+02:00", home: "slovan", away: "joga-bonito", homeScore: 2, awayScore: 3 },
    { number: 6, round: 5, start: "2026-08-15T13:05:00+02:00", home: "invictus", away: "slovan", homeScore: 2, awayScore: 2 }
  ]
};
