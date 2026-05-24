import SwiftUI

struct PlatformsView: View {
    var body: some View {
        List(Platform.demo) { platform in
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(platform.name)
                        .font(.headline)
                    Spacer()
                    Text(String(format: "%.1f/5", platform.rating))
                        .font(.subheadline.bold())
                }
                Text(platform.category)
                    .foregroundStyle(.secondary)
                Text("\(platform.reviewCount) reviews · \(platform.successfulPurchases) successful purchases")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.vertical, 6)
        }
        .navigationTitle("Platforms")
    }
}
