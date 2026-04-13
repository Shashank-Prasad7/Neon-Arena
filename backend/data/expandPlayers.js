const fs = require('fs');
const playersPath = 'C:\\Users\\prera\\Projects\\Football_WEB\\backend\\data\\players.json';
const players = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));

const clubsToFill = [
  { name: 'Real Madrid', manager: 'Carlo Ancelotti', formation: '4-3-3 Attack' },
  { name: 'Inter Milan', manager: 'Simone Inzaghi', formation: '3-5-2' },
  { name: 'Bayern Munich', manager: 'Thomas Tuchel', formation: '4-2-3-1' },
  { name: 'Bayer Leverkusen', manager: 'Xabi Alonso', formation: '3-4-3 Attack' },
  { name: 'London Titans', manager: 'Mikel Arteta', formation: '4-3-3 Defense' },
  { name: 'Paris Saints', manager: 'Luis Enrique', formation: '4-3-3' },
  { name: 'London United', manager: 'Pep Guardiola', formation: '4-2-3-1' },
  { name: 'AC Milan', manager: 'Stefano Pioli', formation: '4-2-3-1' },
  { name: 'Napoli', manager: 'Walter Mazzarri', formation: '4-3-3' },
  { name: 'Amsterdam United', manager: 'John van \'t Schip', formation: '4-3-3' }
];

const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger'];
const nationalities = [
  { name: 'Brazil', code: 'br' },
  { name: 'France', code: 'fr' },
  { name: 'England', code: 'gb-eng' },
  { name: 'Germany', code: 'de' },
  { name: 'Spain', code: 'es' },
  { name: 'Argentina', code: 'ar' },
  { name: 'Portugal', code: 'pt' },
  { name: 'Netherlands', code: 'nl' },
  { name: 'Japan', code: 'jp' }
];

let nextId = Math.max(...players.map(p => p.id)) + 1;

// Ensure unique players
const usedNames = new Set(players.map(p => p.name));

function generatePlayer(club, pos) {
  const firstNames = ['Marco', 'Lukas', 'Sandro', 'Hiro', 'Alessandro', 'Oliver', 'Jean', 'David', 'Carlos', 'Erik', 'Jonas', 'Mats', 'Hugo', 'Leo', 'Thiago'];
  const lastNames = ['Vance', 'Thorne', 'Silva', 'Müller', 'Schmidt', 'Sato', 'Ricci', 'Dubois', 'Santos', 'García', 'Webber', 'Nadal', 'Messi', 'Mbappe', 'Kahn'];
  
  let name = '';
  do {
    name = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + 
           lastNames[Math.floor(Math.random() * lastNames.length)];
  } while (usedNames.has(name));
  
  usedNames.add(name);
  const nat = nationalities[Math.floor(Math.random() * nationalities.length)];
  
  return {
    id: nextId++,
    name: name,
    shortName: name.split(' ')[0][0] + '. ' + name.split(' ')[1],
    number: Math.floor(Math.random() * 99) + 1,
    position: pos,
    nationality: nat.name,
    nationalityCode: nat.code,
    club: club,
    age: 20 + Math.floor(Math.random() * 15),
    image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*1000000)}?q=80&w=400&fit=crop`,
    rating: 80 + Math.floor(Math.random() * 15),
    badge: Math.random() > 0.8 ? 'HOT PROSPECT' : null,
    stats: {
      pace: 70 + Math.floor(Math.random() * 25),
      shooting: 60 + Math.floor(Math.random() * 35),
      passing: 70 + Math.floor(Math.random() * 25),
      dribbling: 70 + Math.floor(Math.random() * 25),
      defending: 40 + Math.floor(Math.random() * 55),
      physical: 60 + Math.floor(Math.random() * 35)
    },
    seasonStats: {
      goals: Math.floor(Math.random() * 15),
      assists: Math.floor(Math.random() * 15),
      matches: 20 + Math.floor(Math.random() * 15),
      minutesPlayed: 1800 + Math.floor(Math.random() * 1000),
      passAccuracy: 75 + Math.floor(Math.random() * 20),
      shotsOnTarget: 20 + Math.floor(Math.random() * 40),
      tackles: 10 + Math.floor(Math.random() * 80),
      sprints: 200 + Math.floor(Math.random() * 300)
    },
    recentForm: [],
    careerHighlights: []
  };
}

const formationsData = [];

clubsToFill.forEach(c => {
  const clubPlayers = players.filter(p => p.club === c.name);
  while (clubPlayers.length < 11) {
    const pos = clubPlayers.length === 0 ? 'Goalkeeper' : 
                clubPlayers.length < 5 ? 'Defender' :
                clubPlayers.length < 8 ? 'Midfielder' : 'Forward';
    const newP = generatePlayer(c.name, pos);
    players.push(newP);
    clubPlayers.push(newP);
  }
  
  formationsData.push({
    club: c.name,
    manager: c.manager,
    formation: c.formation,
    squad: clubPlayers.slice(0, 11).map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      status: Math.random() > 0.9 ? 'Injured' : 'Healthy'
    }))
  });
});

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
fs.writeFileSync('C:\\Users\\prera\\Projects\\Football_WEB\\backend\\data\\formations.json', JSON.stringify(formationsData, null, 2));

console.log('Successfully expanded players database and created formations mapping!');
