# PartHunt AI iOS

Native SwiftUI iOS app for PartHunt AI.

## Firebase Setup

1. In Firebase Console, add an iOS app to the existing `parthunt` project.
2. Use this bundle ID:

```text
com.parthunt.app
```

3. Download `GoogleService-Info.plist`.
4. Add it to:

```text
ios/PartHunt/PartHunt/Resources/GoogleService-Info.plist
```

5. Open:

```text
ios/PartHunt/PartHunt.xcodeproj
```

6. Let Xcode resolve Swift Package dependencies.

For Google sign-in:

1. Open `GoogleService-Info.plist`.
2. Copy `REVERSED_CLIENT_ID`.
3. In Xcode, open the PartHunt target settings.
4. Add that value under URL Types > URL Schemes.

## What Works

- Email/password auth through Firebase Auth.
- Google sign-in through Firebase Auth after adding the reversed client ID URL scheme.
- Search by make, model, variant, year, and wanted part.
- Query-driven generated results matching the web app logic.
- Save parts to `users/{uid}/savedParts`.
- Load saved parts from the same Firestore backend.
- Load search history from `users/{uid}/searchHistory`.
- Platform directory.
- External listings open in Safari view.

## Important

The app shows a Firebase setup screen if `GoogleService-Info.plist` is missing.
