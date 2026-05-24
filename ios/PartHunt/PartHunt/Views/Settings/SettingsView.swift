import SwiftUI
import FirebaseAuth

struct SettingsView: View {
    @StateObject private var authService = AuthService()
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Group {
            if appState.user == nil {
                AuthView()
            } else {
                Form {
                    Section("Account") {
                        Text(Auth.auth().currentUser?.email ?? "Signed in")
                        Button("Sign Out", role: .destructive) {
                            authService.signOut()
                        }
                    }

                    Section("Backend") {
                        Text("Firebase project: parthunt")
                        Text("Web: https://parthunt.vercel.app")
                    }
                }
            }
        }
        .navigationTitle("Account")
    }
}
