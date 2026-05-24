import SwiftUI
import FirebaseAuth

struct SavedPartsView: View {
    @StateObject private var viewModel = LibraryViewModel()
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Group {
            if appState.user == nil {
                SignInRequiredView(
                    title: "Save parts across your team",
                    message: "Sign in to keep saved listings synced between web, desktop, and iOS."
                )
            } else {
                List {
                    if viewModel.savedParts.isEmpty {
                        ContentUnavailableView("No saved parts", systemImage: "bookmark", description: Text("Saved parts from web, desktop, or iOS will appear here."))
                    } else {
                        ForEach(viewModel.savedParts) { result in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(result.title).font(.headline)
                                Text("\(result.platformName) · \(result.price)")
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
                .task { await viewModel.loadSavedParts() }
            }
        }
        .navigationTitle("Saved Parts")
    }
}
