const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Allow cross-origin requests from frontend
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// MySQL Database Connection Pool
const db = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'pa55w0rd',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'railway',
  port: Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
});

// Boot check: Ensure required tables exist
(async () => {
  try {
    // 1. Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Records table (for search functionality)
    await db.query(`
      CREATE TABLE IF NOT EXISTS records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        refNumber VARCHAR(255),
        address VARCHAR(255),
        type VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database connected and tables (users, records) ready.');
  } catch (err) {
    console.error('Database setup error:', err.message);
  }
})();

// VULNERABLE REGISTER (SQL Injection Enabled)
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = `INSERT INTO users (name, email, password) VALUES ('${name || ''}', '${email}', '${password}')`;

  try {
    await db.query(sql);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABLE LOGIN (SQL Injection Enabled: ' OR '1'='1)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

  try {
    const [rows] = await db.query(query);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VULNERABLE SEARCH (SQL Injection Enabled)
app.get('/api/search', async (req, res) => {
  const query = req.query.query || '';
  const sql = `SELECT * FROM records WHERE refNumber = '${query}' OR address LIKE '%${query}%' OR type = '${query}'`;

  try {
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend build static files from root dist/
app.use(express.static(path.join(__dirname, '../dist')));

// Serve index.html for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));