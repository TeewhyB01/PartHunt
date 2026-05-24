import Foundation
import FirebaseFirestore

struct PartSearch: Identifiable, Codable, Hashable {
    let id: String
    var searchType: String
    var vehicle: Vehicle
    var selectedPartName: String
    var rawQuery: String
    var generatedSearchTerms: [String]
    var results: [SearchResult]

    init(
        id: String,
        searchType: String,
        vehicle: Vehicle,
        selectedPartName: String,
        rawQuery: String,
        generatedSearchTerms: [String],
        results: [SearchResult]
    ) {
        self.id = id
        self.searchType = searchType
        self.vehicle = vehicle
        self.selectedPartName = selectedPartName
        self.rawQuery = rawQuery
        self.generatedSearchTerms = generatedSearchTerms
        self.results = results
    }

    init?(document: QueryDocumentSnapshot) {
        let data = document.data()
        guard let rawQuery = data["rawQuery"] as? String else { return nil }
        let vehicleData = data["vehicle"] as? [String: Any] ?? [:]
        self.id = document.documentID
        self.searchType = data["searchType"] as? String ?? "vehicle_part"
        self.vehicle = Vehicle(
            make: vehicleData["make"] as? String ?? "",
            model: vehicleData["model"] as? String ?? "",
            variant: vehicleData["variant"] as? String,
            year: vehicleData["year"] as? String
        )
        self.selectedPartName = (data["selectedPartName"] as? String) ?? (vehicleData["wantedItem"] as? String) ?? ""
        self.rawQuery = rawQuery
        self.generatedSearchTerms = data["generatedSearchTerms"] as? [String] ?? []
        self.results = []
    }

    var firestoreData: [String: Any] {
        [
            "searchType": searchType,
            "vehicle": [
                "make": vehicle.make,
                "model": vehicle.model,
                "variant": vehicle.variant as Any,
                "year": vehicle.year as Any,
                "wantedItem": selectedPartName
            ],
            "selectedPartName": selectedPartName,
            "rawQuery": rawQuery,
            "generatedSearchTerms": generatedSearchTerms,
            "resultsCount": results.count,
            "purchaseStatus": "still_looking",
            "searchedAt": FieldValue.serverTimestamp(),
            "updatedAt": FieldValue.serverTimestamp()
        ]
    }
}
