import Foundation
import FirebaseAuth
import FirebaseCore
import GoogleSignIn
import UIKit

@MainActor
final class AuthService: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var fullName = ""
    @Published var errorMessage: String?
    @Published var isWorking = false

    func signIn() async {
        guard FirebaseBootstrap.isConfigured else {
            errorMessage = "Add GoogleService-Info.plist to enable Firebase."
            return
        }
        await perform {
            _ = try await Auth.auth().signIn(withEmail: email, password: password)
        }
    }

    func signUp() async {
        guard FirebaseBootstrap.isConfigured else {
            errorMessage = "Add GoogleService-Info.plist to enable Firebase."
            return
        }
        await perform {
            let result = try await Auth.auth().createUser(withEmail: email, password: password)
            let change = result.user.createProfileChangeRequest()
            change.displayName = fullName
            try await change.commitChanges()
        }
    }

    func resetPassword() async {
        guard FirebaseBootstrap.isConfigured else {
            errorMessage = "Add GoogleService-Info.plist to enable Firebase."
            return
        }
        await perform {
            try await Auth.auth().sendPasswordReset(withEmail: email)
        }
    }

    func signInWithGoogle() async {
        guard FirebaseBootstrap.isConfigured else {
            errorMessage = "Add GoogleService-Info.plist to enable Firebase."
            return
        }
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            errorMessage = "Google client ID is missing from GoogleService-Info.plist."
            return
        }
        guard let presenting = UIApplication.shared.partHuntRootViewController else {
            errorMessage = "Could not open Google sign-in."
            return
        }

        await perform {
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: presenting)
            guard let idToken = result.user.idToken?.tokenString else {
                throw AuthError.missingGoogleToken
            }
            let credential = GoogleAuthProvider.credential(
                withIDToken: idToken,
                accessToken: result.user.accessToken.tokenString
            )
            _ = try await Auth.auth().signIn(with: credential)
        }
    }

    func signOut() {
        try? Auth.auth().signOut()
        GIDSignIn.sharedInstance.signOut()
    }

    private func perform(_ operation: () async throws -> Void) async {
        isWorking = true
        errorMessage = nil
        do {
            try await operation()
        } catch {
            errorMessage = error.localizedDescription
        }
        isWorking = false
    }
}

enum AuthError: LocalizedError {
    case missingGoogleToken

    var errorDescription: String? {
        switch self {
        case .missingGoogleToken:
            "Google did not return an identity token."
        }
    }
}

extension UIApplication {
    var partHuntRootViewController: UIViewController? {
        connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow }?
            .rootViewController
    }
}
