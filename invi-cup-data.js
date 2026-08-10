/*
 * Jediný zdroj rozpisu a výsledků INVICUPU 2026.
 * Během turnaje stačí u odehraného zápasu nahradit null skutečným skóre.
 * Křížová tabulka a celkové pořadí se přepočítají automaticky.
 */
window.INVI_CUP_DATA = {
  updatedAt: "2026-08-10T14:29:40+02:00",
  scoring: {
    win: 3,
    draw: 1,
    loss: 0
  },
  teams: [
    { id: "invictus", name: "Invictus 2011", shortName: "Invictus", logo: "assets/logo-invictus-2011.png", logoType: "crest", seed: 1 },
    { id: "slovan", name: "Slovan Havířov", shortName: "Slovan", logo: "assets/teams/slovan-havirov.png", logoType: "crest", seed: 2 },
    { id: "ludgerovice", name: "Ludgeřovice", shortName: "Ludgeřovice", logo: "assets/teams/ludgerovice.png?v=20260810-modern", logoType: "crest", seed: 3 },
    { id: "lopata-1", name: "Joga Bonito", shortName: "Joga Bonito", logo: "assets/teams/joga-bonito.png?v=20260810-transparent", logoType: "crest", seed: 4 },
    { id: "lopata-2", name: "Lopata", shortName: "Lopata", logo: "assets/teams/lopata.png?v=20260810-pub", logoType: "crest", seed: 5 }
  ],
  matches: [
    { number: 1, round: 1, start: "2026-08-15T09:20:00+02:00", home: "invictus", away: "ludgerovice", homeScore: null, awayScore: null },
    { number: 2, round: 1, start: "2026-08-15T09:45:00+02:00", home: "lopata-1", away: "lopata-2", homeScore: null, awayScore: null },
    { number: 3, round: 2, start: "2026-08-15T10:10:00+02:00", home: "ludgerovice", away: "slovan", homeScore: null, awayScore: null },
    { number: 4, round: 2, start: "2026-08-15T10:35:00+02:00", home: "invictus", away: "lopata-1", homeScore: null, awayScore: null },
    { number: 5, round: 3, start: "2026-08-15T11:00:00+02:00", home: "lopata-2", away: "slovan", homeScore: null, awayScore: null },
    { number: 6, round: 3, start: "2026-08-15T11:25:00+02:00", home: "lopata-1", away: "ludgerovice", homeScore: null, awayScore: null },
    { number: 7, round: 4, start: "2026-08-15T11:50:00+02:00", home: "invictus", away: "lopata-2", homeScore: null, awayScore: null },
    { number: 8, round: 4, start: "2026-08-15T12:15:00+02:00", home: "slovan", away: "lopata-1", homeScore: null, awayScore: null },
    { number: 9, round: 5, start: "2026-08-15T12:40:00+02:00", home: "ludgerovice", away: "lopata-2", homeScore: null, awayScore: null },
    { number: 10, round: 5, start: "2026-08-15T13:05:00+02:00", home: "invictus", away: "slovan", homeScore: null, awayScore: null }
  ]
};
