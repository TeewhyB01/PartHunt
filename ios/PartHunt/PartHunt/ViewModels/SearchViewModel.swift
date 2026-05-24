import Foundation

@MainActor
final class SearchViewModel: ObservableObject {
    @Published var make = ""
    @Published var model = ""
    @Published var variant = ""
    @Published var year = ""
    @Published var wantedItem = ""
    @Published var currentSearch: PartSearch?
    @Published var isSaving = false
    @Published var errorMessage: String?

    private let searchService = SearchService()
    private let firestoreService = FirestoreService()

    var availableModels: [String] {
        VehicleCatalog.models(for: make)
    }

    var availableVariants: [VariantProfile] {
        VehicleCatalog.variants(for: make, model: model)
    }

    var availableYears: [String] {
        VehicleCatalog.years(for: availableVariants.first(where: { $0.name == variant }))
    }

    var canSearch: Bool {
        !make.isEmpty && !model.isEmpty && !variant.isEmpty && !year.isEmpty && !wantedItem.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func resetAfterMakeChange() {
        model = ""
        variant = ""
        year = ""
    }

    func resetAfterModelChange() {
        variant = ""
        year = ""
    }

    func resetAfterVariantChange() {
        year = ""
    }

    func runSearch() async {
        let vehicle = Vehicle(make: make, model: model, variant: variant, year: year)
        do {
            let search = try await searchService.search(vehicle: vehicle, wantedItem: wantedItem)
            currentSearch = search
            try await firestoreService.saveSearch(search)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func save(result: SearchResult) async {
        isSaving = true
        defer { isSaving = false }
        do {
            try await firestoreService.savePart(result)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
