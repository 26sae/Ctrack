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


