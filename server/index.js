const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Fixed CORS logic (origin: true dynamically allows localhost and Railway requests without throwing errors)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. MySQL Database Connection Pool
const db = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'pa55w0rd',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'ctdb',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
});

// Root Route
app.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ctdb');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search Route
app.get('/api/search', async (req, res) => {
  const query = String(req.query.query || '');
  try {
    const sql = `SELECT * FROM ctdb WHERE refNumber = '${query}' OR address LIKE '%${query}%' OR type = '${query}'`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NOTE: Ensure your auth routes (/api/register, /api/login) are imported/added here if they are in separate files!
// e.g., app.use('/api', require('./routes/auth'));

const port = Number(process.env.PORT) || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});