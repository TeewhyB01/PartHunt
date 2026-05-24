import Foundation

struct Vehicle: Codable, Hashable {
    var make: String
    var model: String
    var variant: String?
    var year: String?
}

enum VehicleCatalog {
    static let makes: [String] = [
        "Audi", "BMW", "Citroen", "Fiat", "Ford", "Honda", "Hyundai", "Jaguar", "Kia",
        "Land Rover", "Lexus", "Mazda", "Mercedes-Benz", "Mini", "Nissan", "Peugeot",
        "Renault", "Seat", "Skoda", "Toyota", "Vauxhall", "Volkswagen", "Volvo"
    ]

    static let models: [String: [String]] = [
        "Audi": ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "TT"],
        "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "X1", "X3", "X5", "i3", "i4"],
        "Ford": ["Fiesta", "Focus", "Kuga", "Mondeo", "Puma", "Transit", "Transit Custom", "C-Max", "S-Max"],
        "Lexus": ["CT", "IS", "IS 300h", "ES", "NX", "RX", "UX"],
        "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "GLA", "GLC", "GLE", "Sprinter"],
        "Toyota": ["Aygo", "Yaris", "Corolla", "Auris", "Prius", "C-HR", "RAV4", "Hilux"],
        "Volkswagen": ["Polo", "Golf", "Passat", "Tiguan", "T-Roc", "Touran", "Transporter", "Caddy"]
    ]

    static let variants: [String: [String: [VariantProfile]]] = [
        "Lexus": [
            "IS 300h": [
                VariantProfile(name: "Luxury", from: 2013),
                VariantProfile(name: "Advance", from: 2013),
                VariantProfile(name: "F Sport", from: 2013),
                VariantProfile(name: "Takumi", from: 2019),
                VariantProfile(name: "Premier", from: 2013, to: 2020)
            ]
        ],
        "Ford": [
            "Focus": [
                VariantProfile(name: "Zetec", from: 2012),
                VariantProfile(name: "Titanium", from: 2012),
                VariantProfile(name: "ST-Line", from: 2016),
                VariantProfile(name: "Vignale", from: 2018)
            ]
        ],
        "BMW": [
            "3 Series": [
                VariantProfile(name: "SE", from: 2012),
                VariantProfile(name: "Sport", from: 2012),
                VariantProfile(name: "M Sport", from: 2012),
                VariantProfile(name: "330e", from: 2016)
            ]
        ]
    ]

    static func models(for make: String) -> [String] {
        models[make] ?? ["Standard", "Other"]
    }

    static func variants(for make: String, model: String) -> [VariantProfile] {
        variants[make]?[model] ?? [
            VariantProfile(name: "Standard", from: 2012),
            VariantProfile(name: "SE", from: 2012),
            VariantProfile(name: "Sport", from: 2012),
            VariantProfile(name: "Premium", from: 2012),
            VariantProfile(name: "Other / not sure", from: 2012)
        ]
    }

    static func years(for variant: VariantProfile?) -> [String] {
        guard let variant else { return [] }
        let currentYear = Calendar.current.component(.year, from: Date())
        let start = max(2012, variant.from)
        let end = min(currentYear, variant.to ?? currentYear)
        return stride(from: end, through: start, by: -1).map(String.init)
    }
}

struct VariantProfile: Codable, Hashable, Identifiable {
    var id: String { name }
    let name: String
    let from: Int
    var to: Int?
}
