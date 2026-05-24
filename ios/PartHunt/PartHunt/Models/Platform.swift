import Foundation

struct Platform: Identifiable, Codable, Hashable {
    let id: String
    var name: String
    var category: String
    var rating: Double
    var reviewCount: Int
    var successfulPurchases: Int
    var websiteUrl: String

    static let demo: [Platform] = [
        Platform(id: "ebay", name: "eBay", category: "Online marketplace", rating: 4.3, reviewCount: 214, successfulPurchases: 182, websiteUrl: "https://www.ebay.co.uk"),
        Platform(id: "breakerlink", name: "BreakerLink", category: "Breaker yard", rating: 4.5, reviewCount: 126, successfulPurchases: 119, websiteUrl: "https://www.breakerlink.com"),
        Platform(id: "parts-gateway", name: "Parts Gateway", category: "Specialist parts supplier", rating: 4.2, reviewCount: 87, successfulPurchases: 76, websiteUrl: "https://www.partsgateway.co.uk"),
        Platform(id: "first-choice-spares", name: "1st Choice Spares", category: "Car parts retailer", rating: 4.1, reviewCount: 98, successfulPurchases: 91, websiteUrl: "https://www.1stchoice.co.uk"),
        Platform(id: "local-scrap-yard", name: "Local Scrap Yard", category: "Scrap yard", rating: 3.9, reviewCount: 64, successfulPurchases: 58, websiteUrl: ""),
        Platform(id: "independent-breaker-yard", name: "Independent Breaker Yard", category: "Breaker yard", rating: 4.0, reviewCount: 42, successfulPurchases: 39, websiteUrl: "")
    ]

    func listingUrl(seed: Int, index: Int, query: String) -> String {
        let slug = query.lowercased().replacingOccurrences(of: " ", with: "-")
        if id == "ebay" {
            return "https://www.ebay.co.uk/itm/\(100000000 + ((seed + index * 931) % 899999999))"
        }
        if websiteUrl.isEmpty {
            return "https://example.com/\(id)/\(slug)-\(index)"
        }
        return "\(websiteUrl)/parts/\(slug)-\(index)"
    }
}
