import Foundation

struct SearchService {
    private let endpoint = URL(string: "https://parthunt.vercel.app/api/search-parts")!

    func search(vehicle: Vehicle, wantedItem: String) async throws -> PartSearch {
        let baseQuery = [vehicle.year, vehicle.make, vehicle.model, vehicle.variant, wantedItem]
            .compactMap { $0?.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
            .joined(separator: " ")

        let terms = [
            baseQuery,
            "\(vehicle.make) \(vehicle.model) \(wantedItem)".trimmingCharacters(in: .whitespacesAndNewlines),
            "\(vehicle.year ?? "") \(vehicle.make) \(vehicle.model) \(wantedItem)".trimmingCharacters(in: .whitespacesAndNewlines)
        ].filter { !$0.isEmpty }

        let results = try await liveResults(vehicle: vehicle, wantedItem: wantedItem, rawQuery: baseQuery)

        let search = PartSearch(
            id: "srch_\(Int(Date().timeIntervalSince1970))",
            searchType: "vehicle_part",
            vehicle: vehicle,
            selectedPartName: wantedItem,
            rawQuery: baseQuery,
            generatedSearchTerms: terms,
            results: results
        )

        return search
    }

    private func liveResults(vehicle: Vehicle, wantedItem: String, rawQuery: String) async throws -> [SearchResult] {
        let payload = SearchPartsRequest(
            vehicle: SearchVehiclePayload(
                make: vehicle.make,
                model: vehicle.model,
                variant: vehicle.variant,
                year: vehicle.year,
                wantedItem: wantedItem
            ),
            selectedPart: SelectedPartPayload(name: wantedItem),
            rawQuery: rawQuery,
            page: 1,
            limit: 30
        )

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
            return generateResults(query: rawQuery, vehicle: vehicle, partName: wantedItem)
        }

        let decoded = try JSONDecoder().decode(SearchPartsResponse.self, from: data)
        return decoded.allResults ?? decoded.results
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

private struct SearchPartsRequest: Encodable {
    let vehicle: SearchVehiclePayload
    let selectedPart: SelectedPartPayload
    let rawQuery: String
    let page: Int
    let limit: Int
}

private struct SearchVehiclePayload: Encodable {
    let make: String
    let model: String
    let variant: String?
    let year: String?
    let wantedItem: String
}

private struct SelectedPartPayload: Encodable {
    let name: String
}

private struct SearchPartsResponse: Decodable {
    let results: [SearchResult]
    let allResults: [SearchResult]?
}
