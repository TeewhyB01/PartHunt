# PartHun

PartHunt is a Firebase-backed web app for finding used, scrap, recycled, and replacement car parts.

## What is included

- Web app deployed at `https://parthunt.vercel.app`.
- Electron desktop app scaffold under `desktop/`.
- Native SwiftUI iOS app scaffold under `ios/PartHunt/`.
- Google sign-in with Firebase Authentication.
- Email/password sign-up, sign-in, and password reset with Firebase Authentication.
- Firestore saved parts and saved search metadata under `users/{uid}`.
- Firestore search history, purchase tracking, and verified platform reviews.
- Firebase Storage photo uploads under `users/{uid}/part-photos`.
- Search by part number.
- Search by vehicle details.
- UK registration lookup flow using DVLA Vehicle Enquiry Service through a Firebase Function proxy.
- Interactive clickable car part selector.
- Mock search results structured for a future search API.
- Filtering, sorting, confidence labels, and original listing links.
- Floating chat assistant with mock AI responses.
- Dashboard, history, settings, reviews, top platform trust cards, and platform profile views.
- Mobile responsive layout.

## Run locally

This version is a static multi-page Firebase app. Serve the folder from a local web server:

```sh
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

Firebase Google sign-in usually works on localhost. If sign-in fails, add your local domain in Firebase Console under Authentication > Settings > Authorized domains.

## Deploy to Firebase Hosting

Install/use the Firebase CLI on your machine, then:

```sh
firebase login
firebase use parthunt
firebase deploy
```

The included `firebase.json`, `firestore.rules`, and `storage.rules` are ready for the `parthunt` project.

## UK registration lookup

The official UK route for registration lookup is the DVLA Vehicle Enquiry Service API. It accepts a vehicle registration number and can return vehicle details such as make, year of manufacture, fuel type, engine capacity, colour, MOT status and tax status.


This project includes a Firebase Function proxy at:

```text
/api/vehicle-lookup
```

To configure it:

```sh
firebase functions:secrets:set DVLA_API_KEY
firebase deploy --only functions,hosting
```

The vehicle search page includes a demo fallback for registration `AA19AAA` so the UI can be tested locally before the DVLA key is deployed.

Official references:

- DVLA Vehicle Enquiry Service API: https://developer-portal.driver-vehicle-licensing.api.gov.uk/apis/vehicle-enquiry-service/vehicle-enquiry-service-description.html
- DVSA MOT history API: https://documentation.history.mot.api.gov.uk/


The app uses Firebase Auth, Firestore, and static routing because this workspace does not currently include npm/pnpm/yarn for a Next.js build. The route structure and shared modules are organized so it can be migrated to Next.js App Router later.

## Desktop app

The Electron app lives in:

```text
desktop/
```

Run it with:

```sh
cd desktop
pnpm install
pnpm start
```

Build installers with:

```sh
pnpm build:mac
pnpm build:win
pnpm build:linux
```

The first desktop version wraps the production web app, so it uses the same Firebase Auth, Firestore, Storage, and Functions backend.

## iOS app

The SwiftUI app lives in:

```text
ios/PartHunt/
```

Before building:

1. Add an iOS app in Firebase with bundle ID `com.parthunt.app`.
2. Download `GoogleService-Info.plist`.
3. Put it in `ios/PartHunt/PartHunt/Resources/`.
4. Open `ios/PartHunt/PartHunt.xcodeproj`.
5. Let Xcode resolve Firebase Swift Package dependencies.

The iOS app includes native auth, vehicle search, generated results, saved parts, history, platform cards, and settings screens.

## Future API integration

The current search flow uses realistic mock data. Replace `createMockResults` in `app.js` with a server-backed search function when you add SerpAPI, Bing Search API, Brave Search API, Tavily, or Exa.
