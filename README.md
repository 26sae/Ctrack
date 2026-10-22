**Description:** CleanTrack is a mobile community waste management system intended for use by barangay residents, garbage collectors, and barangay officials in near-community locations. The system utilizes contemporary mobile technology to digitize and optimize the entire process of solid waste management at the barangay level, from scheduling and routing to community reporting and mobilizing volunteers.

The app features a centralized platform for barangay residents to access real-time garbage collection schedules for each zone, report any waste-related infractions like dumping and overflowing trash, find the nearest garbage disposal and recycling stations using an interactive map, and interact with other community members using a community feed.

CleanTrack is developed using React Native technology to support cross-platform mobile functionality, allowing the system to run on both Android and iOS mobile platforms. 

## Local Setup (Vite App)

1. Install dependencies:

	npm install

2. Start the development server:

	npm run dev

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
