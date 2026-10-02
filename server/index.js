const express = require('express');
const mysql = require('mysql2/promise'); // Fixed: changed 'mysql' to 'mysql2'
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'pa55w0rd',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'ctdb',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
});

app.get('/api/search', async (req, res) => {
  const query = String(req.query.query || '');

  try {
    const [rows] = await db.query(
      'SELECT * FROM ctdb WHERE refNumber = ? OR address LIKE ? OR type = ?',
      [query, `%${query}%`, query]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ctdb');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});