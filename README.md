**Description:** CleanTrack is a mobile community waste management system intended for use by barangay residents, garbage collectors, and barangay officials in near-community locations. The system utilizes contemporary mobile technology to digitize and optimize the entire process of solid waste management at the barangay level, from scheduling and routing to community reporting and mobilizing volunteers.

The app features a centralized platform for barangay residents to access real-time garbage collection schedules for each zone, report any waste-related infractions like dumping and overflowing trash, find the nearest garbage disposal and recycling stations using an interactive map, and interact with other community members using a community feed.

CleanTrack is developed using React Native technology to support cross-platform mobile functionality, allowing the system to run on both Android and iOS mobile platforms. 

## Local Setup (Vite App)

1. Install dependencies:

	npm install

2. Create `.env` from the template and configure the database values:

	```powershell
	Copy-Item .env.example .env
	```

	Then set `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, and
	`MYSQLPASSWORD` to the values from Aiven. Keep
	`MYSQL_SSL_CA_PATH=./ca.pem`; the CA certificate must be present at the project
	root.

3. Start the API server in one terminal:

	npm run start

4. Start the Vite frontend in a second terminal:

	npm run dev

The Vite development server proxies `/api` requests to `http://127.0.0.1:5000`.
Leave `VITE_API_BASE_URL` empty for local development and same-origin deployments.
For a separately hosted API, set `VITE_API_BASE_URL` to that API's origin before
building the frontend; Vite embeds this value at build time.

## Login defenses

The login and registration routes use parameterized SQL. New passwords are stored
as scrypt hashes; a successful login upgrades an existing legacy plaintext
password to a hash. Login requests are limited to five per IP address in a
15-minute window. Failed and rate-limited attempts are logged in the API server
terminal without logging credentials. The in-memory limit resets when the server
restarts and is not shared across multiple server instances. If the API is
behind a reverse proxy, set `TRUST_PROXY_HOPS` to the verified number of trusted
proxy hops so Express can determine client IPs correctly. Do not enable proxy
trust without confirming the deployment's network path.

With the API running locally, run `node bruteforce.js` to send six requests using
a fixed dummy account to `127.0.0.1`. The script refuses non-local URLs; the
expected result is five failed logins followed by HTTP 429. Watch the API
terminal for the corresponding security logs.

## Google Maps API Setup

Google Maps is integrated in the Report page so users can pin exact issue locations.

1. Create a Google Cloud project.
2. Enable these APIs:
	- Maps JavaScript API
	- Places API
3. Create an API key and apply restrictions.
4. Copy .env.example to .env.
5. Add your key to .env:

	VITE_GOOGLE_MAPS_API_KEY=your_real_api_key

6. Restart npm run dev after changing env values.

If the key is missing, the app still runs and shows a setup hint in place of the map picker.

## Docker deployment with Aiven MySQL

The Docker image serves the Vite frontend and Express API from one container. Set
these database variables in the container platform's runtime environment:

- `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`
- `MYSQLDATABASE` (also accepts `MYSQL_DATABASE`)

Place Aiven's CA certificate at the project root as `ca.pem` before building the
image. The Dockerfile includes it in the runtime image and sets
`MYSQL_SSL_CA_PATH=/app/ca.pem`. Do not put database credentials or the certificate
in `VITE_` variables; those are bundled into the browser frontend.

The server requires a CA certificate when connecting to an Aiven hostname, verifies
the database certificate, and waits for the database schema setup before accepting
requests. Rebuild and redeploy the image after changing the CA certificate or app
code. Restart or redeploy after changing runtime environment variables.

To check the API and database connection, open
`https://<your-api-host>/api/health`; a working connection returns
`{"status":"ok","database":"connected"}`.
