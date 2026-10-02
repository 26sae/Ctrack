const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// MySQL Connection
const db = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'pa55w0rd',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'ctdb',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
});

// Auto-create users table on boot
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Error creating users table:', err.message);
  }
})();

// --- VULNERABLE AUTH ROUTES FOR SQL INJECTION LAB ---

// 1. REGISTER
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Unsanitized insert for testing
    const sql = `INSERT INTO users (name, email, password) VALUES ('${name || ''}', '${email}', '${password}')`;
    await db.query(sql);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. LOGIN (Vulnerable to ' OR '1'='1)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Raw string concatenation for SQL injection demo
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

// --- SERVE FRONTEND STATIC FILES ---
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to React Router index.html for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});