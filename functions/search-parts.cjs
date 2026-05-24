const platformLookup = [
  {
    id: "ebay",
    name: "eBay",
    category: "Online marketplace",
    categoryKey: "online_marketplace",
    logoUrl: "/assets/platforms/ebay.svg",
    hosts: ["ebay.co.uk", "ebay.com"],
  },
  {
    id: "breakerlink",
    name: "BreakerLink",
    category: "Breaker yard",
    categoryKey: "breaker_yard",
    logoUrl: "/assets/platforms/breakerlink.svg",
    hosts: ["breakerlink.com"],
  },
  {
    id: "1st-choice-spares",
    name: "1st Choice Spares",
    category: "Car parts retailer",
    categoryKey: "car_parts_retailer",
    logoUrl: "/assets/platforms/first-choice-spares.svg",
    hosts: ["1stchoice.co.uk"],
  },
  {
    id: "parts-gateway",
    name: "Parts Gateway",
    category: "Specialist parts supplier",
    categoryKey: "specialist_parts_supplier",
    logoUrl: "/assets/platforms/parts-gateway.svg",
    hosts: ["partsgateway.co.uk"],
  },
];

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function slugify(value = "") {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildSearchQuery(input = {}) {
  const vehicle = input.vehicle || {};
  const selectedPart = input.selectedPart || {};
  const partName = cleanText(selectedPart.name || vehicle.wantedItem || "");
  const vehicleTerms = [vehicle.year, vehicle.make, vehicle.model, vehicle.variant].map(cleanText).filter(Boolean);
  const terms = [];

  if (input.partNumber) terms.push(`"${cleanText(input.partNumber)}"`);
  vehicleTerms.forEach((term) => terms.push(term));
  if (partName && !terms.some((term) => term.replace(/"/g, "").toLowerCase() === partName.toLowerCase())) {
    terms.push(partName);
  }
  if (!input.partNumber && !partName && input.rawQuery) terms.push(cleanText(input.rawQuery));
  if (!input.partNumber && partName) terms.push("car part");

  return terms.filter(Boolean).join(" ");
}

function platformFromUrl(url = "") {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    return platformLookup.find((platform) => platform.hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))) || {
      id: slugify(host) || "web-result",
      name: host || "Web result",
      category: "External listing",
      categoryKey: "other",
      logoUrl: "",
      hosts: [host],
    };
  } catch {
    return {
      id: "web-result",
      name: "Web result",
      category: "External listing",
      categoryKey: "other",
      logoUrl: "",
      hosts: [],
    };
  }
}

function extractPrice(...values) {
  const text = values.map(cleanText).join(" ");
  const match = text.match(/(?:£|GBP\s?)(\d{1,4}(?:[,.]\d{2})?)/i);
  return match ? `£${match[1].replace(",", ".")}` : "";
}

function inferCondition(title = "", snippet = "") {
  const text = `${title} ${snippet}`.toLowerCase();
  if (text.includes("refurb")) return "Refurbished";
  if (text.includes("new ")) return "New";
  if (text.includes("salvage") || text.includes("scrap") || text.includes("breaker")) return "Scrap/breaker part";
  if (text.includes("used") || text.includes("second hand")) return "Used";
  return "Check listing";
}

function confidenceLabel(result = {}, input = {}) {
  const haystack = `${result.title || ""} ${result.snippet || ""}`.toLowerCase();
  const vehicle = input.vehicle || {};
  let score = 0;
  if (input.partNumber && haystack.includes(String(input.partNumber).toLowerCase())) score += 4;
  if (vehicle.make && haystack.includes(String(vehicle.make).toLowerCase())) score += 1;
  if (vehicle.model && haystack.includes(String(vehicle.model).toLowerCase())) score += 1;
  if (vehicle.year && haystack.includes(String(vehicle.year))) score += 1;
  const partName = input.selectedPart?.name || vehicle.wantedItem || input.rawQuery;
  if (partName && haystack.includes(String(partName).toLowerCase())) score += 2;
  if (score >= 5) return "High match";
  if (score >= 2) return "Possible match";
  return "Check carefully";
}

function mapSerpResult(result = {}, input = {}, index = 0) {
  const listingUrl = result.link || "";
  const platform = platformFromUrl(listingUrl);
  const description = cleanText(result.snippet || result.rich_snippet?.top?.detected_extensions?.description || "Review the original listing carefully before buying.");
  const title = cleanText(result.title || "Car part listing");
  return {
    id: `serp-${index + 1}-${slugify(title).slice(0, 42)}`,
    title,
    description,
    imageUrl: result.thumbnail || result.image || "",
    price: extractPrice(title, description) || "Check listing",
    source: platform.name,
    platformId: platform.id,
    platformName: platform.name,
    platformLogoUrl: platform.logoUrl,
    platformCategory: platform.category,
    listingUrl,
    originalDomain: platform.hosts[0] || "",
    condition: inferCondition(title, description),
    location: "Check listing",
    delivery: true,
    deliveryOption: "Check listing",
    confidenceLabel: confidenceLabel(result, input),
  };
}

function mapShoppingImage(result = {}) {
  return {
    title: cleanText(result.title || ""),
    imageUrl: result.thumbnail || result.image || "",
    price: cleanText(result.price || ""),
    source: cleanText(result.source || ""),
  };
}

function sharedWordsScore(a = "", b = "") {
  const aWords = new Set(cleanText(a).toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2));
  const bWords = new Set(cleanText(b).toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2));
  let score = 0;
  aWords.forEach((word) => {
    if (bWords.has(word)) score += 1;
  });
  return score;
}

function enrichWithShoppingImages(results = [], shoppingImages = []) {
  const availableImages = shoppingImages.filter((item) => item.imageUrl);
  if (!availableImages.length) return results;

  return results.map((result, index) => {
    if (result.imageUrl) return result;
    const bestMatch = availableImages
      .map((image, imageIndex) => ({ image, imageIndex, score: sharedWordsScore(result.title, image.title) }))
      .sort((a, b) => b.score - a.score || a.imageIndex - b.imageIndex)[0];
    const image = bestMatch && bestMatch.score > 0 ? bestMatch.image : availableImages[index % availableImages.length];
    return {
      ...result,
      imageUrl: image.imageUrl,
      imageSource: "SerpAPI Google Shopping",
      price: result.price === "Check listing" && image.price ? image.price : result.price,
    };
  });
}

function paginated(items, page, limit) {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.max(1, Math.min(30, Number(limit) || 10));
  const start = (currentPage - 1) * pageSize;
  return {
    results: items.slice(start, start + pageSize),
    totalResults: items.length,
    currentPage,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    hasNextPage: start + pageSize < items.length,
  };
}

async function searchPartsWithSerpApi(input = {}, apiKey = "") {
  if (!apiKey) {
    const error = new Error("SERPAPI_KEY is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.max(1, Math.min(30, Number(input.limit) || 10));
  const query = buildSearchQuery(input);
  if (!query) {
    const error = new Error("Enter a part number, vehicle details, or part name before searching.");
    error.statusCode = 400;
    throw error;
  }

  const requestedResults = Math.min(30, Math.max(limit, page * limit));
  const baseParams = {
    q: query,
    google_domain: "google.co.uk",
    gl: "uk",
    hl: "en",
    api_key: apiKey,
  };
  const params = new URLSearchParams({
    ...baseParams,
    engine: "google",
    num: String(requestedResults),
  });
  const shoppingParams = new URLSearchParams({
    ...baseParams,
    engine: "google_shopping",
  });

  const [organicSearch, shoppingSearch] = await Promise.allSettled([
    fetch(`https://serpapi.com/search.json?${params.toString()}`),
    fetch(`https://serpapi.com/search.json?${shoppingParams.toString()}`),
  ]);

  if (organicSearch.status === "rejected") {
    const error = new Error("SerpAPI search failed.");
    error.statusCode = 502;
    throw error;
  }

  const response = organicSearch.value;
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) {
    const error = new Error(body.error || "SerpAPI search failed.");
    error.statusCode = response.status || 502;
    throw error;
  }

  const organicResults = Array.isArray(body.organic_results) ? body.organic_results : [];
  let shoppingImages = [];
  if (shoppingSearch.status === "fulfilled") {
    const shoppingBody = await shoppingSearch.value.json().catch(() => ({}));
    shoppingImages = Array.isArray(shoppingBody.shopping_results) ? shoppingBody.shopping_results.map(mapShoppingImage) : [];
  }
  const mapped = enrichWithShoppingImages(
    organicResults.map((result, index) => mapSerpResult(result, input, index)),
    shoppingImages,
  );
  return {
    ...paginated(mapped, page, limit),
    allResults: mapped,
    query,
    provider: "serpapi",
  };
}

module.exports = {
  buildSearchQuery,
  searchPartsWithSerpApi,
};
