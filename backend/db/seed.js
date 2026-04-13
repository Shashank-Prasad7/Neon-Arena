const bcrypt = require('bcryptjs');
const db = require('./database');

const users = [
  { name: 'Alex Scout', email: 'alex@neonarena.com', password: 'password123' },
  { name: 'Jamie Analyst', email: 'jamie@neonarena.com', password: 'password123' },
  { name: 'Test User', email: 'test@test.com', password: 'test123' },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)'
);

console.log('Seeding users...');
for (const user of users) {
  const hash = bcrypt.hashSync(user.password, 10);
  insertUser.run(user.name, user.email, hash);
  console.log(`  ✓ ${user.email}`);
}

console.log('Seed complete.');
process.exit(0);
