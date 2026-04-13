const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:\\Users\\prera\\Projects\\Football_WEB\\backend\\data\\players.json', 'utf-8'));

const unsplashImages = [
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400&fit=crop", // sports action
  "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=400&fit=crop", // soccer player profile
  "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=400&fit=crop",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&fit=crop",
  "https://images.unsplash.com/photo-1518605368461-1ee790ab2281?q=80&w=400&fit=crop",
  "https://images.unsplash.com/photo-1511886929837-354d827a08b5?q=80&w=400&fit=crop",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=400&fit=crop",
  "https://images.unsplash.com/photo-1551280857-e63bd0b7fdee?q=80&w=400&fit=crop"
];

for (let i = 0; i < data.length; i++) {
  data[i].image = unsplashImages[i % unsplashImages.length];
}

fs.writeFileSync('C:\\Users\\prera\\Projects\\Football_WEB\\backend\\data\\players.json', JSON.stringify(data, null, 2));

console.log('Players.json updated with real unsplash images.');
