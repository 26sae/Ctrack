const assert = require('node:assert/strict');
const test = require('node:test');
const {
  createLoginRateLimiter,
  hashPassword,
  verifyPassword,
} = require('./auth-security');

test('password hashes verify without storing the original password', async () => {
  const password = 'Correct-Horse-9';
  const storedPassword = await hashPassword(password);

  assert.match(storedPassword, /^scrypt\$/);
  assert.equal(storedPassword.includes(password), false);
  assert.deepEqual(await verifyPassword(password, storedPassword), {
    valid: true,
    needsRehash: false,
  });
  assert.deepEqual(await verifyPassword('wrong-password', storedPassword), {
    valid: false,
    needsRehash: false,
  });
});

test('legacy plaintext passwords are accepted only for upgrade on successful login', async () => {
  assert.deepEqual(await verifyPassword('legacy-pass', 'legacy-pass'), {
    valid: true,
    needsRehash: true,
  });
  assert.deepEqual(await verifyPassword('wrong-pass', 'legacy-pass'), {
    valid: false,
    needsRehash: true,
  });
});

test('login rate limiter blocks after the configured attempts and resets at expiry', () => {
  let currentTime = 1000;
  const limitedIps = [];
  const middleware = createLoginRateLimiter({
    windowMs: 60_000,
    maxAttempts: 2,
    now: () => currentTime,
    onLimit: (ip) => limitedIps.push(ip),
  });

  function sendRequest() {
    const req = { ip: '127.0.0.1' };
    const res = {
      locals: {},
      headers: {},
      set(name, value) {
        this.headers[name] = value;
        return this;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      },
    };
    let continued = false;
    middleware(req, res, () => {
      continued = true;
    });
    return { res, continued };
  }

  assert.equal(sendRequest().continued, true);
  assert.equal(sendRequest().continued, true);

  const blocked = sendRequest();
  assert.equal(blocked.continued, false);
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(blocked.res.headers['Retry-After'], '60');
  assert.deepEqual(limitedIps, ['127.0.0.1']);

  currentTime += 60_000;
  assert.equal(sendRequest().continued, true);
});
