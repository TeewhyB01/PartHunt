import SwiftUI

struct AuthView: View {
    @StateObject private var service = AuthService()
    @State private var mode: AuthMode = .signIn

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    if mode == .signUp {
                        TextField("Full name", text: $service.fullName)
                            .textContentType(.name)
                    }
                    TextField("Email", text: $service.email)
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                    SecureField("Password", text: $service.password)
                        .textContentType(mode == .signUp ? .newPassword : .password)
                }

                if let errorMessage = service.errorMessage {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                }

                Section {
                    Button {
                        Task { await service.signInWithGoogle() }
                    } label: {
                        Label("Continue with Google", systemImage: "globe")
                    }
                    .disabled(service.isWorking)

                    Button(mode.primaryLabel) {
                        Task {
                            switch mode {
                            case .signIn: await service.signIn()
                            case .signUp: await service.signUp()
                            case .resetPassword: await service.resetPassword()
                            }
                        }
                    }
                    .disabled(service.isWorking)

                    Button(mode.secondaryLabel) {
                        mode = mode.next
                    }
                    .buttonStyle(.borderless)
                }
            }
            .navigationTitle(mode.title)
        }
    }
}

enum AuthMode {
    case signIn
    case signUp
    case resetPassword

    var title: String {
        switch self {
        case .signIn: "Sign in"
        case .signUp: "Create account"
        case .resetPassword: "Reset password"
        }
    }

    var primaryLabel: String {
        switch self {
        case .signIn: "Sign In"
        case .signUp: "Create Account"
        case .resetPassword: "Send Reset Email"
        }
    }

    var secondaryLabel: String {
        switch self {
        case .signIn: "Create an account"
        case .signUp: "Already have an account?"
        case .resetPassword: "Back to sign in"
        }
    }

    var next: AuthMode {
        switch self {
        case .signIn: .signUp
        case .signUp: .signIn
        case .resetPassword: .signIn
        }
    }
}
