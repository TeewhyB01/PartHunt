import SwiftUI

struct HistoryView: View {
    @StateObject private var viewModel = LibraryViewModel()

    var body: some View {
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
        .navigationTitle("History")
        .task { await viewModel.loadHistory() }
    }
}
