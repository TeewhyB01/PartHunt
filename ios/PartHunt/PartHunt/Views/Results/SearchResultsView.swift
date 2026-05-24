import SwiftUI
import SafariServices

struct SearchResultsView: View {
    let search: PartSearch
    @ObservedObject var viewModel: SearchViewModel
    @State private var condition = "Any"
    @State private var deliveryOnly = false
    @State private var selectedUrl: URL?

    private var filteredResults: [SearchResult] {
        search.results.filter { result in
            (condition == "Any" || result.condition == condition) && (!deliveryOnly || result.delivery)
        }
    }

    var body: some View {
        List {
            Section {
                Text(search.rawQuery)
                    .font(.headline)
                Picker("Condition", selection: $condition) {
                    ForEach(["Any", "Used", "Refurbished", "New", "Scrap/breaker part"], id: \.self) { option in
                        Text(option).tag(option)
                    }
                }
                Toggle("Delivery available", isOn: $deliveryOnly)
            }

            Section("Results") {
                ForEach(filteredResults) { result in
                    ResultRow(result: result) {
                        Task { await viewModel.save(result: result) }
                    } open: {
                        selectedUrl = URL(string: result.listingUrl)
                    }
                }
            }
        }
        .navigationTitle("Results")
        .sheet(item: $selectedUrl) { url in
            SafariView(url: url)
        }
    }
}

struct ResultRow: View {
    let result: SearchResult
    let save: () -> Void
    let open: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(result.platformName)
                        .font(.caption.bold())
                        .foregroundStyle(.secondary)
                    Text(result.title)
                        .font(.headline)
                }
                Spacer()
                Text(result.price)
                    .font(.title3.bold())
            }

            Text(result.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            HStack {
                Label(result.condition, systemImage: "wrench.and.screwdriver")
                Label(result.delivery ? "Delivery" : "Collection", systemImage: result.delivery ? "shippingbox" : "mappin")
            }
            .font(.caption)
            .foregroundStyle(.secondary)

            HStack {
                Button("View Exact Listing", action: open)
                    .buttonStyle(.borderedProminent)
                Button("Save Part", action: save)
                    .buttonStyle(.bordered)
            }
        }
        .padding(.vertical, 8)
    }
}

struct SafariView: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }

    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}

extension URL: Identifiable {
    public var id: String { absoluteString }
}
