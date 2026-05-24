import Foundation
import FirebaseAuth
import FirebaseFirestore

final class FirestoreService {
    private let db = Firestore.firestore()

    var uid: String? {
        Auth.auth().currentUser?.uid
    }

    func saveSearch(_ search: PartSearch) async throws {
        guard let uid else { return }
        try await db.collection("users")
            .document(uid)
            .collection("searchHistory")
            .document(search.id)
            .setData(search.firestoreData, merge: true)
    }

    func savePart(_ result: SearchResult) async throws {
        guard let uid else { return }
        try await db.collection("users")
            .document(uid)
            .collection("savedParts")
            .document(result.id)
            .setData(result.firestoreData, merge: true)
    }

    func loadSavedParts() async throws -> [SearchResult] {
        guard let uid else { return [] }
        let snapshot = try await db.collection("users")
            .document(uid)
            .collection("savedParts")
            .order(by: "savedAt", descending: true)
            .getDocuments()
        return snapshot.documents.compactMap(SearchResult.init(document:))
    }

    func loadHistory() async throws -> [PartSearch] {
        guard let uid else { return [] }
        let snapshot = try await db.collection("users")
            .document(uid)
            .collection("searchHistory")
            .order(by: "searchedAt", descending: true)
            .getDocuments()
        return snapshot.documents.compactMap(PartSearch.init(document:))
    }
}
