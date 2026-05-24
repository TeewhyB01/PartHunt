import Foundation

struct SearchService {
    func search(vehicle: Vehicle, wantedItem: String) -> PartSearch {
        let baseQuery = [vehicle.year, vehicle.make, vehicle.model, vehicle.variant, wantedItem]
            .compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
            .joined(separator: " ")

        let search = PartSearch(
            id: "srch_\(Int(Date().timeIntervalSince1970))",
            searchType: "vehicle_part",
            vehicle: vehicle,
            selectedPartName: wantedItem,
            rawQuery: baseQuery,
            generatedSearchTerms: [
                "\(baseQuery) used",
                "\(baseQuery) breaker",
                "\(baseQuery) scrap yard",
                "\(vehicle.make) \(vehicle.model) \(wantedItem) replacement part"
            ],
            results: generateResults(query: baseQuery, vehicle: vehicle, partName: wantedItem)
        )

        return search
    }

    private func generateResults(query: String, vehicle: Vehicle, partName: String) -> [SearchResult] {
        let platforms = Platform.demo
        let prices = priceRange(for: partName)
        let seed = abs(query.hashValue)
        let conditions = ["Used", "Used", "Refurbished", "Used", "New", "Scrap/breaker part", "Used", "Refurbished"]
        let locations = ["Manchester", "Birmingham", "Leeds", "London", "Bristol", "Glasgow", "Cardiff", "Sheffield"]

        return platforms.enumerated().map { index, platform in
            let price = prices.lowerBound + ((seed + index * 47) % max(1, prices.upperBound - prices.lowerBound))
            return SearchResult(
                id: "res-\(platform.id)-\(index)-\(seed)",
                title: "\(query) \(index == 0 ? "used replacement part" : "matched listing")",
                description: "Generated from your search. Confirm part number, side, condition, delivery cost, and return policy before buying.",
                imageUrl: nil,
                price: "£\(price)",
                platformId: platform.id,
                platformName: platform.name,
                platformCategory: platform.category,
                listingUrl: platform.listingUrl(seed: seed, index: index, query: query),
                condition: conditions[index % conditions.count],
                location: locations[index % locations.count],
                delivery: index % 4 != 0,
                confidenceLabel: index < 2 ? "High match" : "Possible match"
            )
        }
    }

    private func priceRange(for partName: String) -> Range<Int> {
        let value = partName.lowercased()
        if value.contains("engine") { return 650..<2800 }
        if value.contains("gearbox") || value.contains("transmission") { return 380..<1600 }
        if value.contains("alternator") || value.contains("starter") { return 45..<240 }
        if value.contains("bumper") || value.contains("bonnet") || value.contains("door") { return 55..<360 }
        if value.contains("mirror") || value.contains("light") { return 35..<260 }
        return 25..<320
    }
}
