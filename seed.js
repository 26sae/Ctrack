// seed.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const { getDatabaseConfig } = require('./server/database');

const ROWS_TO_INSERT = 5000;
const BATCH_SIZE = 500;

const types = ['Residential', 'Commercial', 'Industrial', 'Vacant Lot', 'Agricultural'];

function randomRecord(i) {
  const type = types[Math.floor(Math.random() * types.length)];
  const refNumber = `REF-${1000 + i}`;
  const address = `${Math.floor(Math.random() * 999) + 1} Fake St, Block ${Math.floor(Math.random() * 50)}, Test City`;
  return [refNumber, address, type];
}

async function seed() {
  const db = await mysql.createConnection(getDatabaseConfig());

  console.log(`Inserting ${ROWS_TO_INSERT} rows...`);

  for (let batchStart = 0; batchStart < ROWS_TO_INSERT; batchStart += BATCH_SIZE) {
    const batch = [];
    for (let i = batchStart; i < Math.min(batchStart + BATCH_SIZE, ROWS_TO_INSERT); i++) {
      batch.push(randomRecord(i));
    }
    await db.query(
      'INSERT INTO records (refNumber, address, type) VALUES ?',
      [batch]
    );
    console.log(`Inserted ${Math.min(batchStart + BATCH_SIZE, ROWS_TO_INSERT)} / ${ROWS_TO_INSERT}`);
  }

  console.log('Done.');
  await db.end();
}

seed().catch(err => {
  console.error('Seed error:', err.message);
  process.exit(1);
});