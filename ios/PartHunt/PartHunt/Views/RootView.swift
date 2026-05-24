import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Group {
            if !FirebaseBootstrap.isConfigured {
                FirebaseSetupView()
            } else if !appState.authReady {
                ProgressView("Loading PartHunt AI")
            } else {
                MainTabView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationStack { SearchVehicleView() }
                .tabItem { Label("Search", systemImage: "magnifyingglass") }

            NavigationStack { SavedPartsView() }
                .tabItem { Label("Saved", systemImage: "bookmark") }

            NavigationStack { HistoryView() }
                .tabItem { Label("History", systemImage: "clock.arrow.circlepath") }

            NavigationStack { PlatformsView() }
                .tabItem { Label("Platforms", systemImage: "star.circle") }

            NavigationStack { SettingsView() }
                .tabItem { Label("Account", systemImage: "person.circle") }
        }
    }
}

struct SignInRequiredView: View {
    let title: String
    let message: String

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Image(systemName: "person.crop.circle.badge.plus")
                .font(.system(size: 46))
                .foregroundStyle(.blue)
            Text(title)
                .font(.title.bold())
            Text(message)
                .foregroundStyle(.secondary)
            NavigationLink {
                AuthView()
            } label: {
                Label("Sign in or create account", systemImage: "person.crop.circle")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(.systemGroupedBackground))
    }
}

struct FirebaseSetupView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("PartHunt AI")
                .font(.largeTitle.bold())
            Text("Firebase setup needed")
                .font(.title2.bold())
            Text("Add GoogleService-Info.plist to PartHunt/Resources, then rebuild the app. The iOS app will use the same Firebase Auth, Firestore, Storage, and Functions backend as the web and desktop apps.")
                .foregroundStyle(.secondary)
        }
        .padding(24)
    }
}
