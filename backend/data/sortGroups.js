const fs = require('fs');
const filepath = 'C:\\Users\\prera\\Projects\\Football_WEB\\backend\\data\\worldcup-groups.json';
const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

// Sort groups by name (Group A, Group B, ...)
data.groups.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
console.log('World Cup groups sorted alphabetically (Group A-H)!');
