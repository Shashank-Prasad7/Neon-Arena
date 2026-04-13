const fs = require('fs');

const leagues = [
  {
    name: "La Liga", code: "PD", id: 2014,
    teams: [
      { name: "Real Madrid", crest: "https://crests.football-data.org/86.png" },
      { name: "Barcelona", crest: "https://crests.football-data.org/81.png" },
      { name: "Real Betis", crest: "https://crests.football-data.org/90.png" },
      { name: "Real Sociedad", crest: "https://crests.football-data.org/92.svg" },
      { name: "Atletico Madrid", crest: "https://crests.football-data.org/78.png" },
      { name: "Villarreal", crest: "https://crests.football-data.org/94.png" },
      { name: "Valencia", crest: "https://crests.football-data.org/95.png" },
      { name: "Sevilla", crest: "https://crests.football-data.org/77.png" }
    ]
  },
  {
    name: "Premier League", code: "PL", id: 2021,
    teams: [
      { name: "Liverpool", crest: "https://crests.football-data.org/64.png" },
      { name: "Chelsea", crest: "https://crests.football-data.org/61.png" },
      { name: "Manchester United", crest: "https://crests.football-data.org/66.png" },
      { name: "Manchester City", crest: "https://crests.football-data.org/65.png" },
      { name: "Tottenham Hotspurs", crest: "https://crests.football-data.org/73.svg" },
      { name: "Wolverhampton", crest: "https://crests.football-data.org/76.svg" },
      { name: "Leicester City", crest: "https://crests.football-data.org/338.png" },
      { name: "West Ham United", crest: "https://crests.football-data.org/563.png" },
      { name: "Arsenal", crest: "https://crests.football-data.org/57.png" },
      { name: "Aston Villa", crest: "https://crests.football-data.org/58.png" }
    ]
  },
  {
    name: "Bundesliga", code: "BL1", id: 2002,
    teams: [
      { name: "Bayern Munich", crest: "https://crests.football-data.org/5.png" },
      { name: "Bayern Leverkusen", crest: "https://crests.football-data.org/3.png" },
      { name: "Borussia Dortmund", crest: "https://crests.football-data.org/4.png" },
      { name: "RB Leipzig", crest: "https://crests.football-data.org/721.png" },
      { name: "Eintracht Frankfurt", crest: "https://crests.football-data.org/19.png" },
      { name: "VfB Stuttgart", crest: "https://crests.football-data.org/10.png" }
    ]
  },
  {
    name: "Ligue 1", code: "FL1", id: 2015,
    teams: [
      { name: "Paris Saint German", crest: "https://crests.football-data.org/524.png" },
      { name: "Lens", crest: "https://crests.football-data.org/546.png" },
      { name: "Marseille", crest: "https://crests.football-data.org/516.png" },
      { name: "Lille", crest: "https://crests.football-data.org/521.png" },
      { name: "Rennes", crest: "https://crests.football-data.org/529.png" },
      { name: "Monaco", crest: "https://crests.football-data.org/548.png" },
      { name: "Lyon", crest: "https://crests.football-data.org/523.png" }
    ]
  },
  {
    name: "Serie A", code: "SA", id: 2019,
    teams: [
      { name: "Juventus", crest: "https://crests.football-data.org/109.png" },
      { name: "Roma", crest: "https://crests.football-data.org/100.png" },
      { name: "Inter Milan", crest: "https://crests.football-data.org/108.png" },
      { name: "AC Milan", crest: "https://crests.football-data.org/98.png" },
      { name: "Napoli", crest: "https://crests.football-data.org/113.png" },
      { name: "Como", crest: "https://crests.football-data.org/7342.png" },
      { name: "Atalanta", crest: "https://crests.football-data.org/102.png" },
      { name: "Lazio", crest: "https://crests.football-data.org/110.png" }
    ]
  },
  {
    name: "Champions League", code: "CL", id: 2001,
    teams: [
      { name: "Real Madrid", crest: "https://crests.football-data.org/86.png" },
      { name: "Bayern Munich", crest: "https://crests.football-data.org/5.png" },
      { name: "Manchester City", crest: "https://crests.football-data.org/65.png" },
      { name: "Paris Saint German", crest: "https://crests.football-data.org/524.png" },
      { name: "Juventus", crest: "https://crests.football-data.org/109.png" },
      { name: "Liverpool", crest: "https://crests.football-data.org/64.png" },
      { name: "Inter Milan", crest: "https://crests.football-data.org/108.png" },
      { name: "Arsenal", crest: "https://crests.football-data.org/57.png" }
    ]
  }
];

let matchId = 1000;
const matches = [];

leagues.forEach(league => {
  // Generate 18 matches per league to ensure plenty of data
  // Split: 6 LIVE, 6 UPCOMING, 6 FINISHED
  const statusCounts = { "LIVE": 6, "UPCOMING": 6, "FINISHED": 6 };
  
  Object.keys(statusCounts).forEach(status => {
    for (let i = 0; i < statusCounts[status]; i++) {
        const t = league.teams;
        const homeIdx = Math.floor(Math.random() * t.length);
        let awayIdx = Math.floor(Math.random() * t.length);
        while (homeIdx === awayIdx) {
            awayIdx = Math.floor(Math.random() * t.length);
        }
        
        let score = { home: null, away: null };
        let minute = undefined;
        let actualStatus = status;

        if (status === "LIVE") {
            actualStatus = "IN_PLAY";
            score.home = Math.floor(Math.random() * 4);
            score.away = Math.floor(Math.random() * 3);
            minute = Math.floor(Math.random() * 90) + 1;
        } else if (status === "FINISHED") {
            score.home = Math.floor(Math.random() * 5);
            score.away = Math.floor(Math.random() * 4);
        } else if (status === "UPCOMING") {
            actualStatus = "SCHEDULED";
        }

        const baseDate = new Date();
        if (status === "FINISHED") baseDate.setDate(baseDate.getDate() - (Math.floor(Math.random() * 5) + 1));
        if (status === "UPCOMING") baseDate.setDate(baseDate.getDate() + (Math.floor(Math.random() * 5) + 1));
        
        matches.push({
            id: ++matchId,
            competition: { id: league.id, name: league.name, code: league.code },
            utcDate: baseDate.toISOString(),
            status: actualStatus,
            minute: minute,
            homeTeam: { name: t[homeIdx].name, shortName: t[homeIdx].name.substring(0,3).toUpperCase(), crest: t[homeIdx].crest },
            awayTeam: { name: t[awayIdx].name, shortName: t[awayIdx].name.substring(0,3).toUpperCase(), crest: t[awayIdx].crest },
            score: score,
            stats: (status === "LIVE" || status === "FINISHED") ? { 
                "possession": `${10 + Math.floor(Math.random() * 80)}% - ${90 - (10 + Math.floor(Math.random() * 80))}%`, 
                "xG": `${(Math.random()*3).toFixed(1)} - ${(Math.random()*3).toFixed(1)}` 
            } : {},
            group: "Matchweek " + (Math.floor(Math.random() * 38) + 1)
        });
    }
  });
});

fs.writeFileSync('C:\\Users\\prera\\Projects\\Football_WEB\\backend\\data\\matches.json', JSON.stringify({ matches }, null, 2));
console.log('Matches updated with 18 matches per league (6 live, 6 upcoming, 6 finished)!');
