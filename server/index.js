const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const users = new Map();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'pa55w0rd',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'ctdb',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
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

app.get('/api/search', async (req, res) => {
  const query = String(req.query.query || '');
  try {
    const sql = 'SELECT * FROM ctdb WHERE refNumber = ? OR address LIKE ? OR type = ?';
    const [rows] = await db.query(sql, [query, `%${query}%`, query]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = users.get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    const user = {
      id: Date.now().toString(),
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role: 'user'
    };

    users.set(normalizedEmail, user);
    return res.status(201).json({ user: { ...user } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.get(normalizedEmail);
    if (!user || user.password !== String(password)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});