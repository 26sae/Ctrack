// Local-only login rate-limit smoke test. This does not guess passwords.
const axios = require('axios');

const target = new URL(process.env.LOGIN_TEST_URL || 'http://127.0.0.1:5000/api/login');
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

if (target.protocol !== 'http:' || !localHosts.has(target.hostname)) {
  throw new Error('Safety check: LOGIN_TEST_URL must be a local HTTP URL.');
}

const email = 'rate-limit-test@example.invalid';
const password = 'not-a-real-password';
const requestCount = 6;

async function checkLoginRateLimit() {
  console.log(`Sending ${requestCount} local test requests to ${target.href}`);

  for (let attempt = 1; attempt <= requestCount; attempt += 1) {
    try {
      const response = await axios.post(target.href, { email, password });
      console.log(`Request ${attempt}: HTTP ${response.status}`);
    } catch (error) {
      if (error.response) {
        console.log(`Request ${attempt}: HTTP ${error.response.status} - ${error.response.data.error}`);
      } else {
        console.error(`Request ${attempt}: ${error.message}`);
      }
    }
  }

  console.log('Check the API server terminal for failed-login and rate-limit logs.');
}

checkLoginRateLimit();
