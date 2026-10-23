const {
  createHash,
  randomBytes,
  scrypt: scryptCallback,
  timingSafeEqual,
} = require('crypto');
const { promisify } = require('util');

// BEGIN AUTH DEFENSE HELPERS: password hashing, verification, and login throttling.
const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, PASSWORD_KEY_LENGTH);

  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

async function verifyPassword(password, storedPassword) {
  if (storedPassword.startsWith('scrypt$')) {
    const [, saltHex, keyHex, ...extra] = storedPassword.split('$');
    if (
      extra.length > 0
      || !/^[\da-f]{32}$/i.test(saltHex || '')
      || !/^[\da-f]{128}$/i.test(keyHex || '')
    ) {
      return { valid: false, needsRehash: false };
    }

    const salt = Buffer.from(saltHex, 'hex');
    const expectedKey = Buffer.from(keyHex, 'hex');
    const actualKey = await scrypt(password, salt, PASSWORD_KEY_LENGTH);

    return {
      valid: timingSafeEqual(actualKey, expectedKey),
      needsRehash: false,
    };
  }

  const actualDigest = createHash('sha256').update(password).digest();
  const storedDigest = createHash('sha256').update(storedPassword).digest();

  return {
    valid: timingSafeEqual(actualDigest, storedDigest),
    needsRehash: true,
  };
}

function createLoginRateLimiter({
  windowMs = LOGIN_WINDOW_MS,
  maxAttempts = LOGIN_MAX_ATTEMPTS,
  now = Date.now,
  onLimit = (ip, retryAfterSeconds) => {
    console.warn(`[AUTH] login rate limit reached ip=${ip} retry_after=${retryAfterSeconds}s`);
  },
} = {}) {
  const attemptsByIp = new Map();
  let requestsSinceCleanup = 0;

  return function loginRateLimiter(req, res, next) {
    const currentTime = now();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    let entry = attemptsByIp.get(ip);

    if (!entry || entry.resetAt <= currentTime) {
      entry = { count: 0, resetAt: currentTime + windowMs };
      attemptsByIp.set(ip, entry);
    }

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup >= 256) {
      for (const [address, value] of attemptsByIp) {
        if (value.resetAt <= currentTime) {
          attemptsByIp.delete(address);
        }
      }
      requestsSinceCleanup = 0;
    }

    if (entry.count >= maxAttempts) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - currentTime) / 1000));
      onLimit(ip, retryAfterSeconds);
      return res
        .set('Retry-After', String(retryAfterSeconds))
        .status(429)
        .json({ error: 'Too many login attempts. Please try again later.' });
    }

    entry.count += 1;
    res.locals.loginAttempt = entry.count;
    res.locals.loginAttemptLimit = maxAttempts;
    return next();
  };
}

module.exports = {
  createLoginRateLimiter,
  hashPassword,
  verifyPassword,
};
// END AUTH DEFENSE HELPERS
