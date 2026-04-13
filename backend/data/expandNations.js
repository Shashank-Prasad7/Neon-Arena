const fs = require('fs');
const filepath = 'C:\\Users\\prera\\Projects\\Football_WEB\\backend\\data\\worldcup-groups.json';
const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

let newNations = [];
data.groups.forEach(group => {
  group.teams.forEach(team => {
    newNations.push({
      name: team.name,
      code: team.code,
      group: group.name
    });
  });
});

data.nations = newNations;
fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
console.log('Nations array expanded to 32 successfully!');
