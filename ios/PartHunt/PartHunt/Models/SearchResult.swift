import Foundation
import FirebaseFirestore

struct SearchResult: Identifiable, Codable, Hashable {
    let id: String
    var title: String
    var description: String
    var imageUrl: String?
    var price: String
    var platformId: String
    var platformName: String
    var platformCategory: String
    var listingUrl: String
    var condition: String
    var location: String
    var delivery: Bool
    var confidenceLabel: String

    init(
        id: String,
        title: String,
        description: String,
        imageUrl: String?,
        price: String,
        platformId: String,
        platformName: String,
        platformCategory: String,
        listingUrl: String,
        condition: String,
        location: String,
        delivery: Bool,
        confidenceLabel: String
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.imageUrl = imageUrl
        self.price = price
        self.platformId = platformId
        self.platformName = platformName
        self.platformCategory = platformCategory
        self.listingUrl = listingUrl
        self.condition = condition
        self.location = location
        self.delivery = delivery
        self.confidenceLabel = confidenceLabel
    }

    init?(document: QueryDocumentSnapshot) {
        let data = document.data()
        guard let title = data["title"] as? String else { return nil }
        self.id = document.documentID
        self.title = title
        self.description = data["description"] as? String ?? ""
        self.imageUrl = data["imageUrl"] as? String
        self.price = data["price"] as? String ?? ""
        self.platformId = data["platformId"] as? String ?? ""
        self.platformName = data["platformName"] as? String ?? ""
        self.platformCategory = data["platformCategory"] as? String ?? ""
        self.listingUrl = data["listingUrl"] as? String ?? ""
        self.condition = data["condition"] as? String ?? ""
        self.location = data["location"] as? String ?? ""
        self.delivery = data["delivery"] as? Bool ?? false
        self.confidenceLabel = data["confidenceLabel"] as? String ?? ""
    }

    var firestoreData: [String: Any] {
        [
            "title": title,
            "description": description,
            "imageUrl": imageUrl as Any,
            "price": price,
            "platformId": platformId,
            "platformName": platformName,
            "platformCategory": platformCategory,
            "listingUrl": listingUrl,
            "condition": condition,
            "location": location,
            "delivery": delivery,
            "confidenceLabel": confidenceLabel,
            "savedAt": FieldValue.serverTimestamp()
        ]
    }
}
