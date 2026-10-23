const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { getDatabaseConfig } = require('./database');
const {
  createLoginRateLimiter,
  hashPassword,
  verifyPassword,
} = require('./auth-security');

const app = express();

const trustProxyHops = process.env.TRUST_PROXY_HOPS?.trim();
if (trustProxyHops) {
  const hopCount = Number(trustProxyHops);
  if (!Number.isInteger(hopCount) || hopCount < 1) {
    throw new Error('TRUST_PROXY_HOPS must be a positive integer when set.');
  }
  app.set('trust proxy', hopCount);
}

// Allow cross-origin requests from frontend
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// MySQL Database Connection Pool
const db = mysql.createPool(getDatabaseConfig());
const loginRateLimiter = createLoginRateLimiter();

// Boot check: Ensure required tables exist
async function initializeDatabase() {
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
}

app.get('/api/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

// POST SQL injection defense: validate input types and bind all values with placeholders.
app.post('/api/register', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const passwordHash = await hashPassword(password);
    await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, passwordHash],
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email is already registered' });
    }
    console.error('[AUTH] registration failed:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST SQL injection defense: bind the email; compare the password to its stored hash in application code.
// Login defense: cap requests per IP and log failures without logging credentials.
app.post('/api/login', loginRateLimiter, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, password, created_at FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    const user = rows[0];

    if (!user || typeof user.password !== 'string') {
      console.warn(
        `[AUTH] failed login ip=${req.ip} attempt=${res.locals.loginAttempt}/${res.locals.loginAttemptLimit}`,
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordCheck = await verifyPassword(password, user.password);
    if (!passwordCheck.valid) {
      console.warn(
        `[AUTH] failed login ip=${req.ip} attempt=${res.locals.loginAttempt}/${res.locals.loginAttemptLimit}`,
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (passwordCheck.needsRehash) {
      const passwordHash = await hashPassword(password);
      await db.execute('UPDATE users SET password = ? WHERE id = ?', [passwordHash, user.id]);
    }

    console.info(`[AUTH] successful login ip=${req.ip}`);
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('[AUTH] login failed:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});
// END AUTH DEFENSES

// GET SQL injection defense: bind all search values; never concatenate the request query into SQL.
app.get('/api/search', async (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query : '';

  try {
    const [rows] = await db.execute(
      'SELECT * FROM records WHERE refNumber = ? OR address LIKE ? OR type = ?',
      [query, `%${query}%`, query],
    );
    res.json(rows);
  } catch (error) {
    console.error('[SEARCH] query failed:', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Serve frontend build static files from root dist/
app.use(express.static(path.join(__dirname, '../dist')));

// Serve index.html for all non-API routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const port = Number(process.env.PORT) || 5000;
initializeDatabase()
  .then(() => app.listen(port, () => console.log(`Server running on port ${port}`)))
  .catch((error) => {
    console.error('Database setup error:', error.message);
    process.exitCode = 1;
  });