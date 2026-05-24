# PartHunt AI Desktop and iOS App Plan

## Goal

Turn PartHunt AI into a multi-platform product with:

- Web app
- Electron desktop app
- Native iOS app built with Swift

All versions should use the same backend, same Firebase project, same authentication, same Firestore database, same storage, and the same user data.

The user experience should feel consistent across platforms, but each app should still feel natural for the device it runs on.

---

## 1. Product Architecture

The recommended architecture is:

```text
PartHunt AI

Shared Firebase backend
- Firebase Authentication
- Firestore Database
- Firebase Storage
- Firebase Functions
- Optional future search API proxy

Client apps
- Web app
- Electron desktop app
- Native iOS Swift app
```

The key principle is that the apps should not have separate databases.

All user accounts, saved parts, search history, platform reviews, and storage uploads should live in the same Firebase project.

---

## 2. Shared Backend

The existing Firebase backend should remain the source of truth.

Use the same Firebase project:

```text
Project ID: parthunt
Auth domain: parthunt.firebaseapp.com
Storage bucket: parthunt.firebasestorage.app
```

Shared backend services:

- Firebase Authentication
- Firestore
- Firebase Storage
- Firebase Functions
- Firebase Hosting, optional
- Vercel for web hosting, already active

Current public web app:

```text
https://parthunt.vercel.app
```

---

## 3. Shared Data Model

All platforms should use the same collections.

Recommended Firestore collections:

```text
users/{userId}
users/{userId}/searchHistory/{searchId}
users/{userId}/savedParts/{savedPartId}
users/{userId}/platformReviews/{reviewId}

platforms/{platformId}
platformReviews/{reviewId}
searchResults/{searchId}
```

Recommended shared entities:

- User profile
- Vehicle
- Part
- Search history
- Search result
- Saved part
- Platform
- Platform review
- Purchase status

Important:

- The user ID from Firebase Auth should be the main key across all apps.
- A user signing in on web, desktop, or iOS should see the same dashboard data.
- Reviews left on iOS should appear on web and desktop.
- Saved parts from desktop should appear on iOS.

---

## 4. Authentication Strategy

Use Firebase Authentication everywhere.

Supported sign-in methods:

- Email and password
- Google sign-in

### Web

The current web app uses Firebase Web SDK.

Firebase authorized domains should include:

```text
parthunt.vercel.app
localhost
```

Optional preview domain:

```text
parthunt-62fokkngu-dorcasley-4270s-projects.vercel.app
```

### Electron

Electron should also use Firebase Auth.

Recommended approach:

- Use Firebase Web SDK inside the Electron renderer.
- For Google sign-in, use a browser-based OAuth flow.
- Avoid embedding sensitive secrets in the desktop app.
- Use Firebase security rules to protect data rather than trusting the client.

Desktop auth options:

1. Email/password directly inside Electron.
2. Google sign-in through popup or external browser.
3. Future option: custom auth flow using Firebase Functions.

### iOS Swift

Use the official Firebase iOS SDK.

Required SDKs:

- FirebaseAuth
- FirebaseFirestore
- FirebaseStorage
- FirebaseFunctions
- GoogleSignIn

iOS auth should support:

- Email/password sign-in
- Email/password sign-up
- Password reset
- Google sign-in
- Sign out

For Google sign-in on iOS:

- Configure reversed client ID in Xcode URL schemes.
- Add the iOS app to the Firebase project.
- Download `GoogleService-Info.plist`.

---

## 5. Electron Desktop App Plan

## 5.1 Recommended Stack

Use:

- Electron
- Vite or Electron Forge
- TypeScript
- Existing HTML/CSS/JS where possible
- Firebase Web SDK

Recommended setup:

```text
desktop/
  package.json
  electron/
    main.ts
    preload.ts
  src/
    renderer/
      index.html
      app.ts
      styles.css
```

Since the current app is static HTML/CSS/JS, there are two possible routes.

### Option A: Wrap the Existing Web App

Electron loads the deployed web app:

```text
https://parthunt.vercel.app
```

Pros:

- Fastest route
- Desktop always uses latest deployed web version
- Less duplicate code

Cons:

- Requires internet access
- Feels less native
- Harder to add desktop-specific features

### Option B: Bundle the Web App Locally

Electron loads local app files:

```text
file://...
```

Pros:

- Can launch faster
- Better offline shell
- More control over desktop behavior

Cons:

- Needs release builds whenever frontend changes
- More packaging complexity

Recommended MVP:

Use Option A first, then move to Option B when the frontend is converted to a proper shared app structure.

---

## 5.2 Electron Features

Desktop MVP should include:

- App window
- Login
- Search by vehicle
- Search by part number
- Results page
- Saved parts
- History
- Platform reviews
- Settings
- External listing opening in system browser

Desktop-specific improvements:

- Native app menu
- Keyboard shortcuts
- Desktop notifications for price alerts, future feature
- File upload for part photos, future feature
- Auto-update, future feature

---

## 5.3 Electron Security

Use secure Electron defaults:

```ts
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  preload: preloadPath
}
```

Rules:

- Do not expose Firebase admin credentials in Electron.
- Do not use Firebase Admin SDK in the client.
- Use Firestore security rules.
- Open external seller links in the system browser.
- Validate URLs before opening them.
- Keep API keys client-safe only.

---

## 5.4 Electron Build and Distribution

Recommended tools:

- Electron Forge
- Electron Builder
- Vite Electron plugin

Target platforms:

- macOS
- Windows
- Linux, optional

Build outputs:

```text
macOS: .dmg
Windows: .exe installer
Linux: AppImage, optional
```

Future:

- Code signing
- Auto-updates
- App notarization for macOS

---

## 6. iOS Swift App Plan

## 6.1 Recommended Stack

Use:

- Swift
- SwiftUI
- Firebase iOS SDK
- GoogleSignIn
- SafariServices for external listing links

Recommended app structure:

```text
ios/
  PartHunt/
    App/
      PartHuntApp.swift
    Core/
      FirebaseManager.swift
      AuthService.swift
      FirestoreService.swift
      StorageService.swift
    Models/
      Vehicle.swift
      Part.swift
      SearchHistory.swift
      SearchResult.swift
      Platform.swift
      PlatformReview.swift
    Views/
      Auth/
      Dashboard/
      Search/
      Results/
      Platforms/
      SavedParts/
      Settings/
    ViewModels/
```

---

## 6.2 iOS Main Screens

Build the iOS app as a native version of the same product.

Screens:

- Launch screen
- Sign in
- Sign up
- Forgot password
- Home
- Search by vehicle
- Search by part number
- Search results
- Result detail
- Saved parts
- Search history
- Platform directory
- Platform profile
- Review form
- Settings

Navigation:

- Use `NavigationStack`
- Use tab navigation for main signed-in areas

Suggested tabs:

```text
Search
Saved
History
Platforms
Account
```

---

## 6.3 iOS Search Flow

Vehicle search should include:

- Make dropdown
- Model dropdown
- Variant dropdown
- Year dropdown
- Item wanted field
- Search Part button

The iOS app should generate the same query shape as the web app:

```text
{year} {make} {model} {variant} {wantedItem}
```

Generated internal search terms can include:

```text
{query} used
{query} breaker
{query} scrap yard
{make} {model} {wantedItem} replacement part
```

User-facing query should not force words like:

```text
used scrap breaker
```

---

## 6.4 iOS External Listing Behavior

When a user taps a result:

- Validate that the URL is an exact listing URL.
- Open it in `SFSafariViewController` or the system browser.
- Require sign-in before opening exact listing links.

Suggested behavior:

```text
Guest taps listing
→ show sign-in prompt
→ after sign-in, return to result
→ user can open exact listing
```

---

## 6.5 iOS Firebase Setup

Steps:

1. Add an iOS app inside Firebase project.
2. Bundle ID example:

```text
com.parthunt.app
```

3. Download:

```text
GoogleService-Info.plist
```

4. Add it to Xcode.
5. Install Firebase SDK packages with Swift Package Manager.
6. Configure Firebase in `PartHuntApp.swift`.

Example:

```swift
import SwiftUI
import FirebaseCore

@main
struct PartHuntApp: App {
    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}
```

---

## 7. Shared Search Service

The search logic should eventually move out of the clients and into Firebase Functions.

Recommended future endpoint:

```text
POST /searchParts
```

Input:

```json
{
  "userId": "abc",
  "searchType": "vehicle_part",
  "vehicle": {
    "make": "Lexus",
    "model": "IS 300h",
    "variant": "F Sport",
    "year": "2020"
  },
  "wantedItem": "front bumper"
}
```

Output:

```json
{
  "searchId": "srch_123",
  "rawQuery": "2020 Lexus IS 300h F Sport front bumper",
  "generatedSearchTerms": [],
  "results": []
}
```

Benefits:

- Same search behavior across web, desktop, and iOS
- Search API keys stay on the backend
- Easier rate limiting
- Easier logging
- Better security

---

## 8. Shared Platform Trust System

All apps should read and write platform trust data from the same database.

Shared features:

- Platform directory
- Platform profile
- Average rating
- Review count
- Successful purchase count
- User reviews
- Would-buy-again percentage
- Popular part categories

Rules:

- Only signed-in users can write reviews.
- Reviews should be linked to search history.
- Users should not be able to randomly review a platform without a linked search.

---

## 9. Storage Strategy

Firebase Storage should be used for:

- Future part photos
- User-uploaded damaged-part images
- Platform logos, if admin-managed later
- Review photos, future feature

Storage paths:

```text
users/{userId}/uploads/{fileId}
platforms/{platformId}/logos/{fileId}
reviews/{reviewId}/photos/{fileId}
```

Security:

- Users can read their own uploads.
- Users can write only to their own folder.
- Public platform logos can be readable by everyone.
- Review images can be readable if the review is public.

---

## 10. Firebase Security Rules

Rules must support all clients equally.

Core rules:

- Users can read/write their own user document.
- Users can read/write their own search history.
- Users can read/write their own saved parts.
- Users can create reviews only when signed in.
- Public platform data can be read by everyone.
- Platform aggregate scores should be updated by backend functions where possible.

Important:

Do not rely on the client app type for security.

The backend should not care whether a request comes from:

- Web
- Electron
- iOS

It should care only:

- Is the user authenticated?
- Is the user allowed to read/write this document?
- Is the data valid?

---

## 11. Shared Design System

The apps should feel like one product.

Shared design language:

- Calm
- Minimal
- Futuristic
- Soft light mode
- Premium dark mode
- Blue/teal accents
- Platform logo cards
- Clear search journey

Web and Electron can share CSS.

iOS should recreate the design natively with SwiftUI:

- Cards
- Rounded 8px-style corners
- Soft shadows
- Light/dark mode
- Thin icons
- Clear forms
- Native pickers

---

## 12. Recommended Repository Structure

Current repo can evolve into:

```text
PartHunt/
  web/
    index.html
    site.js
    site-data.js
    styles.css
    multipage.css

  desktop/
    package.json
    electron/
    src/

  ios/
    PartHunt.xcodeproj
    PartHunt/

  shared/
    models/
    search/
    firebase/

  functions/
    index.js
    package.json

  docs/
    product/
    technical/
```

For now, the web app is at the repo root.

Recommended next step:

Move web files into a `web/` folder only when ready to update Vercel routing and Electron packaging.

---

## 13. Development Phases

## Phase 1: Stabilise Web App

Tasks:

- Keep polishing web app
- Confirm Firebase Auth works on deployed domain
- Confirm Firestore rules
- Confirm saved parts and history
- Confirm platform reviews
- Confirm search result generation
- Add real search API later

Outcome:

The web app becomes the reference implementation.

---

## Phase 2: Shared Backend Cleanup

Tasks:

- Formalise Firestore collections
- Add shared data model documentation
- Move search generation into Firebase Functions
- Add real search API proxy
- Add platform rating aggregation
- Add validation for reviews and saved parts

Outcome:

All apps can use the same backend logic.

---

## Phase 3: Electron MVP

Tasks:

- Create `desktop/` folder
- Set up Electron
- Load deployed web app first
- Add secure window config
- Open external listing links in system browser
- Package macOS build
- Package Windows build

Outcome:

Team can install PartHunt AI as a desktop app.

---

## Phase 4: Native iOS MVP

Tasks:

- Create Firebase iOS app
- Create Xcode project
- Add Firebase SDK
- Build auth screens
- Build search screen
- Build results screen
- Build saved parts
- Build history
- Build platform directory
- Build platform profile
- Add review form

Outcome:

Team can use PartHunt AI on iPhone with the same account and data.

---

## Phase 5: Cross-Platform Sync Testing

Test cases:

- Sign up on web, sign in on iOS.
- Save a part on iOS, view it on desktop.
- Search on desktop, view history on web.
- Mark an item as bought on web, leave review on iOS.
- Review appears on platform profile on all apps.
- Sign out on one app does not break other sessions.

Outcome:

All apps work together as one product.

---

## Phase 6: Production Polish

Tasks:

- Real search API
- Better search ranking
- App icons
- Splash screens
- Error states
- Offline-friendly states
- Crash reporting
- Analytics
- App Store preparation
- Desktop auto-updates
- Code signing

Outcome:

PartHunt AI is ready for broader internal or public testing.

---

## 14. Risks and Decisions

## Real Search Quality

The current search is generated/demo logic.

For production, use a real search provider:

- Brave Search API
- Bing Web Search API
- SerpAPI
- Tavily
- Exa

Recommendation:

Use a Firebase Function as the search proxy so API keys are never exposed in web, desktop, or iOS clients.

---

## Electron Versus Web Wrapper

Fastest desktop MVP:

```text
Electron wrapping https://parthunt.vercel.app
```

Best long-term desktop app:

```text
Electron with bundled frontend and shared backend services
```

Recommendation:

Start with wrapper, then improve.

---

## iOS Native Versus WebView

Fastest iOS MVP:

```text
WebView app
```

Best iOS product:

```text
Native SwiftUI app
```

The user requested Swift, so the recommended path is native SwiftUI.

---

## Firebase Auth Across Platforms

Potential setup issues:

- Google sign-in requires different setup for web and iOS.
- Electron Google sign-in may need external browser flow.
- Authorized domains must include deployed web domains.
- iOS needs bundle ID and URL scheme configuration.

---

## 15. Immediate Next Steps

1. Confirm Firebase Auth works on:

```text
https://parthunt.vercel.app
```

2. Add Firebase iOS app:

```text
Bundle ID: com.parthunt.app
```

3. Create `desktop/` folder and Electron MVP.

4. Create `ios/` folder and SwiftUI Xcode project.

5. Move search logic to Firebase Functions before adding a real search provider.

6. Add shared documentation for Firestore collections and models.

---

## 16. MVP Definition

Desktop MVP is complete when:

- User can install/open desktop app
- User can sign in
- User can search for parts
- User can view results
- User can open exact listings
- User can save parts
- User can view history
- Data syncs with web

iOS MVP is complete when:

- User can install on iPhone
- User can sign in
- User can search by vehicle and item
- User can view results
- User can open exact listings
- User can save parts
- User can view history
- User can view platform profiles
- Data syncs with web and desktop

---

## 17. Recommended Build Order

1. Finish web app data model and Firebase rules.
2. Move search into Firebase Functions.
3. Build Electron wrapper MVP.
4. Package desktop app for internal team testing.
5. Build SwiftUI auth and search screens.
6. Build SwiftUI results, saved parts, history, and platforms.
7. Run cross-platform sync tests.
8. Add real search provider.
9. Polish and prepare distribution.

