import SwiftUI

struct HistoryView: View {
    @StateObject private var viewModel = LibraryViewModel()
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Group {
            if appState.user == nil {
                SignInRequiredView(
                    title: "Track every search",
                    message: "Sign in to sync search history and purchase tracking across all PartHunt apps."
                )
            } else {
                List {
                    if viewModel.history.isEmpty {
                        ContentUnavailableView("No search history", systemImage: "clock", description: Text("Searches from any PartHunt app will sync here."))
                    } else {
                        ForEach(viewModel.history) { search in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(search.rawQuery).font(.headline)
                                Text(search.searchType)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
                .task { await viewModel.loadHistory() }
            }
        }
        .navigationTitle("History")
    }
}
