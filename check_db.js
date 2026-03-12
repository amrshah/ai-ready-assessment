import Database from 'better-sqlite3';
const db = new Database('leads.db');
try {
  const rows = db.prepare('SELECT * FROM leads').all();
  console.log('--- LEADS IN DATABASE ---');
  console.log(JSON.stringify(rows, null, 2));
  console.log('-------------------------');
} catch (err) {
  console.error('Error reading database:', err.message);
}
