import Foundation

@MainActor
final class LibraryViewModel: ObservableObject {
    @Published var savedParts: [SearchResult] = []
    @Published var history: [PartSearch] = []
    @Published var errorMessage: String?

    private let firestoreService = FirestoreService()

    func loadSavedParts() async {
        do {
            savedParts = try await firestoreService.loadSavedParts()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadHistory() async {
        do {
            history = try await firestoreService.loadHistory()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
