import Foundation
import FirebaseAuth

@MainActor
final class AppState: ObservableObject {
    @Published var user: User?
    @Published var authReady = false
    @Published var selectedTab: AppTab = .search

    private var authHandle: AuthStateDidChangeListenerHandle?

    init() {
        FirebaseBootstrap.configureIfAvailable()

        guard FirebaseBootstrap.isConfigured else {
            authReady = true
            return
        }

        authHandle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                self?.user = user
                self?.authReady = true
            }
        }
    }

    deinit {
        if let authHandle {
            Auth.auth().removeStateDidChangeListener(authHandle)
        }
    }
}

enum AppTab: Hashable {
    case search
    case saved
    case history
    case platforms
    case settings
}
