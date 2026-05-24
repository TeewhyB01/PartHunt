import SwiftUI
import SafariServices

struct SearchResultsView: View {
    let search: PartSearch
    @ObservedObject var viewModel: SearchViewModel
    @State private var condition = "Any"
    @State private var deliveryOnly = false
    @State private var selectedUrl: URL?
    @State private var comparedResults: Set<String> = []
    @State private var agentResult: SearchResult?

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
                    ResultRow(
                        result: result,
                        isCompared: comparedResults.contains(result.id)
                    ) {
                        if comparedResults.contains(result.id) {
                            comparedResults.remove(result.id)
                        } else {
                            if comparedResults.count >= 4, let first = comparedResults.first {
                                comparedResults.remove(first)
                            }
                            comparedResults.insert(result.id)
                        }
                    } askAgent: {
                        agentResult = result
                    } open: {
                        selectedUrl = URL(string: result.listingUrl)
                    }
                }
            }

            if !comparedResults.isEmpty {
                Section("Compare") {
                    ForEach(search.results.filter { comparedResults.contains($0.id) }) { result in
                        HStack {
                            Text(result.title)
                                .font(.subheadline.bold())
                            Spacer()
                            Text(result.price)
                                .foregroundStyle(.secondary)
                        }
                    }
                    Button("Clear comparison") {
                        comparedResults.removeAll()
                    }
                }
            }
        }
        .navigationTitle("Results")
        .sheet(item: $selectedUrl) { url in
            SafariView(url: url)
        }
        .sheet(item: $agentResult) { result in
            AgentResultView(result: result)
        }
    }
}

struct ResultRow: View {
    let result: SearchResult
    let isCompared: Bool
    let compare: () -> Void
    let askAgent: () -> Void
    let open: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            AsyncImage(url: URL(string: result.imageUrl ?? "")) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFit()
                case .failure:
                    ContentUnavailableView("No image available", systemImage: "photo")
                case .empty:
                    ProgressView()
                @unknown default:
                    EmptyView()
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 190)
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))

            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(result.platformName)
                        .font(.caption.bold())
                        .foregroundStyle(.secondary)
                    Text(result.title)
                        .font(.headline)
                }
                Spacer(minLength: 12)
                VStack(alignment: .trailing, spacing: 4) {
                    Text(result.price)
                        .font(.title3.bold())
                    Text(result.confidenceLabel)
                        .font(.caption.bold())
                        .foregroundStyle(confidenceColor)
                }
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
                Button(isCompared ? "Selected" : "Compare", action: compare)
                    .buttonStyle(.bordered)
                Button("Ask Agent", action: askAgent)
                    .buttonStyle(.bordered)
            }
            .buttonStyle(.bordered)
        }
        .padding(.vertical, 8)
    }

    private var confidenceColor: Color {
        switch result.confidenceLabel {
        case "High match":
            return .green
        case "Possible match":
            return .orange
        default:
            return .red
        }
    }
}

struct AgentResultView: View {
    let result: SearchResult

    var body: some View {
        NavigationStack {
            List {
                Section("Listing") {
                    Text(result.title)
                    Text(result.platformName)
                    Text(result.price)
                }

                Section("PartHunt Agent") {
                    Text("Check the part number, vehicle year range, side, condition photos, seller returns, and delivery cost before opening the listing.")
                    Text("This result is marked “\(result.confidenceLabel)”, so compare the title against your vehicle details carefully.")
                }
            }
            .navigationTitle("Ask Agent")
            .navigationBarTitleDisplayMode(.inline)
        }
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
