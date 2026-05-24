# PartHunt AI Cross-Platform Runbook

This runbook explains how the web, desktop, and iOS apps work together.

## Shared Backend

All apps use the same Firebase project:

```text
parthunt
```

Shared services:

- Firebase Authentication
- Firestore
- Firebase Storage
- Firebase Functions

Shared user data lives under:

```text
users/{uid}
users/{uid}/searchHistory/{searchId}
users/{uid}/savedParts/{savedPartId}
users/{uid}/platformReviews/{reviewId}
platformReviews/{reviewId}
```

## Web

Production:

```text
https://parthunt.vercel.app
```

Local:

```sh
python3 -m http.server 4173
```

## Desktop

The first Electron version loads the production web app in a secure native shell.

Run:

```sh
cd desktop
pnpm install
pnpm start
```

Build:

```sh
pnpm build:mac
pnpm build:win
```

External seller links open in the system browser.

## iOS

The iOS app is a native SwiftUI Firebase client.

Before opening in Xcode:

1. Add an iOS app in Firebase.
2. Use bundle ID:

```text
com.parthunt.app
```

3. Download `GoogleService-Info.plist`.
4. Put it here:

```text
ios/PartHunt/PartHunt/Resources/GoogleService-Info.plist
```

5. Open:

```text
ios/PartHunt/PartHunt.xcodeproj
```

6. Add Firebase SDK packages in Xcode:

```text
https://github.com/firebase/firebase-ios-sdk
```

Products:

- FirebaseAuth
- FirebaseFirestore
- FirebaseStorage
- FirebaseFunctions
- FirebaseCore

For Google sign-in, also add:

```text
https://github.com/google/GoogleSignIn-iOS
```

The generated Xcode project already references Firebase and Google Sign-In packages. After adding `GoogleService-Info.plist`, copy the plist's `REVERSED_CLIENT_ID` value into the iOS target URL schemes.

## Firebase Auth Domains

Add these in Firebase Authentication > Settings > Authorized domains:

```text
parthunt.vercel.app
localhost
```

For desktop, auth is served from the production web domain, so no separate Electron domain is needed for the wrapper build.

## Team Sync Test

Use this checklist before giving builds to the team:

- Sign in on web.
- Search for a part.
- Save a part.
- Open desktop and sign in with the same account.
- Confirm saved part appears.
- Open iOS and sign in with the same account.
- Confirm search history and saved parts appear.
- Mark an item as bought on one platform.
- Confirm the change appears on the others.
