import SwiftUI

struct SearchVehicleView: View {
    @StateObject private var viewModel = SearchViewModel()
    @State private var showResults = false

    var body: some View {
        Form {
            Section("Vehicle") {
                Picker("Make", selection: $viewModel.make) {
                    Text("Select make").tag("")
                    ForEach(VehicleCatalog.makes, id: \.self) { make in
                        Text(make).tag(make)
                    }
                }
                .onChange(of: viewModel.make) { _, _ in viewModel.resetAfterMakeChange() }

                Picker("Model", selection: $viewModel.model) {
                    Text("Select model").tag("")
                    ForEach(viewModel.availableModels, id: \.self) { model in
                        Text(model).tag(model)
                    }
                }
                .disabled(viewModel.make.isEmpty)
                .onChange(of: viewModel.model) { _, _ in viewModel.resetAfterModelChange() }

                Picker("Variant", selection: $viewModel.variant) {
                    Text("Select variant").tag("")
                    ForEach(viewModel.availableVariants) { variant in
                        Text(variant.name).tag(variant.name)
                    }
                }
                .disabled(viewModel.model.isEmpty)
                .onChange(of: viewModel.variant) { _, _ in viewModel.resetAfterVariantChange() }

                Picker("Year", selection: $viewModel.year) {
                    Text("Select year").tag("")
                    ForEach(viewModel.availableYears, id: \.self) { year in
                        Text(year).tag(year)
                    }
                }
                .disabled(viewModel.variant.isEmpty)
            }

            Section("Part") {
                TextField("Item you are looking for", text: $viewModel.wantedItem, axis: .vertical)
                    .lineLimit(2...4)
            }

            if let errorMessage = viewModel.errorMessage {
                Text(errorMessage)
                    .foregroundStyle(.red)
            }

            Section {
                Button {
                    Task {
                        await viewModel.runSearch()
                        showResults = true
                    }
                } label: {
                    Label("Search Part", systemImage: "magnifyingglass")
                }
                .disabled(!viewModel.canSearch)
            }
        }
        .navigationTitle("Search")
        .navigationDestination(isPresented: $showResults) {
            if let search = viewModel.currentSearch {
                SearchResultsView(search: search, viewModel: viewModel)
            }
        }
    }
}
