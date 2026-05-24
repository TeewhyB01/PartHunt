import SwiftUI
import FirebaseCore

@main
struct PartHuntApp: App {
    @StateObject private var appState = AppState()

    init() {
        FirebaseBootstrap.configureIfAvailable()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
        }
    }
}

enum FirebaseBootstrap {
    static var isConfigured: Bool {
        FirebaseApp.app() != nil
    }

    static func configureIfAvailable() {
        guard FirebaseApp.app() == nil else { return }
        guard Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else {
            return
        }
        FirebaseApp.configure()
    }
}
