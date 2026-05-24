import SwiftUI

struct SavedPartsView: View {
    @StateObject private var viewModel = LibraryViewModel()

    var body: some View {
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
        .navigationTitle("Saved Parts")
        .task { await viewModel.loadSavedParts() }
    }
}
