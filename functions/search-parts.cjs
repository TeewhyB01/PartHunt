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

const countryConfigs = {
  GB: { code: "GB", name: "United Kingdom", ebayMarketplaceId: "EBAY_GB", ebayCountry: "GB", ebayDomain: "ebay.co.uk", googleDomain: "google.co.uk", gl: "uk", location: "United Kingdom" },
  US: { code: "US", name: "United States", ebayMarketplaceId: "EBAY_US", ebayCountry: "US", ebayDomain: "ebay.com", googleDomain: "google.com", gl: "us", location: "United States" },
  IE: { code: "IE", name: "Ireland", ebayMarketplaceId: "EBAY_IE", ebayCountry: "IE", ebayDomain: "ebay.ie", googleDomain: "google.ie", gl: "ie", location: "Ireland" },
  CA: { code: "CA", name: "Canada", ebayMarketplaceId: "EBAY_CA", ebayCountry: "CA", ebayDomain: "ebay.ca", googleDomain: "google.ca", gl: "ca", location: "Canada" },
  AU: { code: "AU", name: "Australia", ebayMarketplaceId: "EBAY_AU", ebayCountry: "AU", ebayDomain: "ebay.com.au", googleDomain: "google.com.au", gl: "au", location: "Australia" },
  DE: { code: "DE", name: "Germany", ebayMarketplaceId: "EBAY_DE", ebayCountry: "DE", ebayDomain: "ebay.de", googleDomain: "google.de", gl: "de", location: "Germany" },
  FR: { code: "FR", name: "France", ebayMarketplaceId: "EBAY_FR", ebayCountry: "FR", ebayDomain: "ebay.fr", googleDomain: "google.fr", gl: "fr", location: "France" },
  ES: { code: "ES", name: "Spain", ebayMarketplaceId: "EBAY_ES", ebayCountry: "ES", ebayDomain: "ebay.es", googleDomain: "google.es", gl: "es", location: "Spain" },
  IT: { code: "IT", name: "Italy", ebayMarketplaceId: "EBAY_IT", ebayCountry: "IT", ebayDomain: "ebay.it", googleDomain: "google.it", gl: "it", location: "Italy" },
  NL: { code: "NL", name: "Netherlands", ebayMarketplaceId: "EBAY_NL", ebayCountry: "NL", ebayDomain: "ebay.nl", googleDomain: "google.nl", gl: "nl", location: "Netherlands" },
  BE: { code: "BE", name: "Belgium", ebayMarketplaceId: "EBAY_BE", ebayCountry: "BE", ebayDomain: "ebay.be", googleDomain: "google.be", gl: "be", location: "Belgium" },
};

const countryAliases = {
  uk: "GB",
  gb: "GB",
  "great britain": "GB",
  "united kingdom": "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "northern ireland": "GB",
  us: "US",
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  ireland: "IE",
  germany: "DE",
  france: "FR",
  spain: "ES",
  italy: "IT",
  canada: "CA",
  australia: "AU",
  netherlands: "NL",
  belgium: "BE",
};

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function resolveSearchCountry(input = {}) {
  const raw = cleanText(input.country || input.userCountry || input.vehicle?.country || "");
  const code = countryConfigs[raw.toUpperCase()] ? raw.toUpperCase() : countryAliases[raw.toLowerCase()];
  return countryConfigs[code] || countryConfigs.GB;
}

function slugify(value = "") {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildSearchQuery(input = {}) {
  const vehicle = input.vehicle || {};
  const selectedPart = input.selectedPart || {};
  const partName = cleanText(selectedPart.name || vehicle.wantedItem || "");
  const variant = /other|not sure/i.test(vehicle.variant || "") ? "" : vehicle.variant;
  const vehicleTerms = [vehicle.year, vehicle.make, vehicle.model, variant].map(cleanText).filter(Boolean);
  const engineCapacity = Number(vehicle.engineCapacity);
  const engineSize = cleanText(vehicle.engineSize || (engineCapacity ? `${engineCapacity >= 1000 ? `${(engineCapacity / 1000).toFixed(1).replace(/\.0$/, "")}L ` : ""}${engineCapacity}cc` : ""));
  const colour = vehicle.colour && /bumper|door|bonnet|boot|wing|mirror|panel|tailgate|lid/i.test(partName) ? vehicle.colour : "";
  const fitmentTerms = [vehicle.bodyType, vehicle.fuelType, engineSize, colour].map(cleanText).filter(Boolean);
  const terms = [];

  if (input.partNumber) terms.push(`"${cleanText(input.partNumber)}"`);
  vehicleTerms.forEach((term) => terms.push(term));
  if (partName && !terms.some((term) => term.replace(/"/g, "").toLowerCase() === partName.toLowerCase())) {
    terms.push(partName);
  }
  fitmentTerms.forEach((term) => {
    if (!terms.some((existing) => existing.toLowerCase() === term.toLowerCase())) terms.push(term);
  });
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

function tokenise(value = "") {
  return cleanText(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);
}

function resultMatchScore(result = {}, input = {}) {
  const vehicle = input.vehicle || {};
  const partName = cleanText(input.selectedPart?.name || vehicle.wantedItem || input.rawQuery || "");
  const haystack = `${result.title || ""} ${result.description || ""} ${result.platformName || ""}`.toLowerCase();
  let score = 0;

  if (input.partNumber && haystack.includes(String(input.partNumber).toLowerCase())) score += 50;
  if (vehicle.make && haystack.includes(String(vehicle.make).toLowerCase())) score += 12;
  if (vehicle.model && haystack.includes(String(vehicle.model).toLowerCase())) score += 12;
  if (vehicle.year && haystack.includes(String(vehicle.year))) score += 8;
  if (partName && haystack.includes(partName.toLowerCase())) score += 24;

  const partWords = tokenise(partName);
  partWords.forEach((word) => {
    if (haystack.includes(word)) score += 4;
  });

  if (result.imageUrl) score += 6;
  if (result.price && result.price !== "Check listing") score += 5;
  if (result.confidenceLabel === "High match") score += 14;
  if (result.confidenceLabel === "Possible match") score += 6;
  if (result.listingUrl && /^https?:\/\//i.test(result.listingUrl)) score += 4;

  return score;
}

function getWantedPartName(input = {}) {
  const vehicle = input.vehicle || {};
  return cleanText(input.selectedPart?.name || vehicle.wantedItem || input.rawQuery || input.partNumber || "car part");
}

function formatMoney(price = {}) {
  if (!price || !price.value) return "";
  const currency = price.currency || "GBP";
  const symbol = currency === "GBP" ? "£" : `${currency} `;
  return `${symbol}${price.value}`;
}

function normalizeEbayImage(url = "") {
  return String(url || "").replace(/s-l\d+\.jpg/i, "s-l500.jpg");
}

function mapEbayResult(item = {}, input = {}, index = 0, country = countryConfigs.GB) {
  const title = cleanText(item.title || "eBay vehicle part listing");
  const locationParts = [item.itemLocation?.city, item.itemLocation?.postalCode, item.itemLocation?.country].map(cleanText).filter(Boolean);
  const shippingOption = Array.isArray(item.shippingOptions) ? item.shippingOptions[0] : null;
  const shippingCost = shippingOption?.shippingCost ? formatMoney(shippingOption.shippingCost) : "";
  const deliveryOption = shippingOption?.shippingCostType === "FIXED" && shippingCost ? `Delivery ${shippingCost}` : "Check delivery";
  const itemWebUrl = item.itemWebUrl || "";
  let originalDomain = country.ebayDomain;
  try {
    if (itemWebUrl) originalDomain = new URL(itemWebUrl).hostname.replace(/^www\./, "");
  } catch {
    originalDomain = country.ebayDomain;
  }
  return {
    id: `ebay-${item.itemId || index + 1}`,
    title,
    description: cleanText(item.shortDescription || item.subtitle || `eBay listing for ${getWantedPartName(input)}. Check fitment, part number, side, condition, postage, and returns before buying.`),
    imageUrl: normalizeEbayImage(item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || item.additionalImages?.[0]?.imageUrl || ""),
    price: formatMoney(item.price) || "Check listing",
    source: "eBay",
    platformId: "ebay",
    platformName: "eBay",
    platformLogoUrl: "/assets/platforms/ebay.svg",
    platformCategory: "Online marketplace",
    listingUrl: itemWebUrl,
    originalDomain,
    condition: cleanText(item.condition || "Check listing"),
    location: locationParts.join(", ") || "Check listing",
    delivery: Boolean(shippingOption),
    deliveryOption,
    confidenceLabel: confidenceLabel({ title, snippet: item.shortDescription || "" }, input),
    seller: item.seller?.username || "",
    country: country.name,
  };
}

let ebayTokenCache = {
  accessToken: "",
  expiresAt: 0,
  key: "",
};

async function getEbayApplicationToken(clientId = "", clientSecret = "") {
  if (!clientId || !clientSecret) return "";
  const cacheKey = `${clientId}:${clientSecret.slice(0, 8)}`;
  const now = Date.now();
  if (ebayTokenCache.accessToken && ebayTokenCache.expiresAt > now + 60000 && ebayTokenCache.key === cacheKey) {
    return ebayTokenCache.accessToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }).toString(),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    const error = new Error(body.error_description || body.error || "eBay authentication failed.");
    error.statusCode = response.status || 502;
    throw error;
  }

  ebayTokenCache = {
    accessToken: body.access_token,
    expiresAt: now + Math.max(300, Number(body.expires_in) || 7200) * 1000,
    key: cacheKey,
  };
  return ebayTokenCache.accessToken;
}

async function searchPartsWithEbay(input = {}, clientId = "", clientSecret = "") {
  if (!clientId || !clientSecret) {
    const error = new Error("EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are not configured.");
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

  const token = await getEbayApplicationToken(clientId, clientSecret);
  const country = resolveSearchCountry(input);
  const offset = (page - 1) * limit;
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": country.ebayMarketplaceId,
      "X-EBAY-C-ENDUSERCTX": `contextualLocation=country=${country.ebayCountry}`,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const apiError = Array.isArray(body.errors) && body.errors[0] ? body.errors[0] : {};
    const error = new Error(apiError.message || body.error_description || "eBay Browse API search failed.");
    error.statusCode = response.status || 502;
    throw error;
  }

  const items = Array.isArray(body.itemSummaries) ? body.itemSummaries : [];
  const mapped = items.map((item, index) => mapEbayResult(item, input, offset + index, country));
  const totalResults = Math.min(Number(body.total) || mapped.length, 10000);
  return {
    results: mapped,
    allResults: mapped,
    totalResults,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(totalResults / limit)),
    hasNextPage: offset + limit < totalResults,
    query,
    provider: "ebay",
    country: country.code,
    countryName: country.name,
  };
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

  const country = resolveSearchCountry(input);
  const requestedResults = Math.min(30, Math.max(limit, page * limit));
  const baseParams = {
    q: query,
    google_domain: country.googleDomain,
    gl: country.gl,
    hl: "en",
    location: country.location,
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
    country: country.code,
    countryName: country.name,
  };
}

function dedupeResults(results = []) {
  const seen = new Set();
  return results.filter((result) => {
    const key = cleanText(result.listingUrl || result.title).toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function rankAndMixResults(results = [], input = {}) {
  const ranked = dedupeResults(results)
    .map((result, index) => ({
      ...result,
      _rankScore: resultMatchScore(result, input),
      _sourceIndex: index,
    }))
    .sort((a, b) => b._rankScore - a._rankScore || a._sourceIndex - b._sourceIndex);

  const queues = new Map();
  ranked.forEach((result) => {
    const key = cleanText(result.platformId || result.platformName || result.source || "unknown").toLowerCase();
    if (!queues.has(key)) queues.set(key, []);
    queues.get(key).push(result);
  });

  const mixed = [];
  let lastPlatform = "";
  while (mixed.length < ranked.length) {
    const candidates = Array.from(queues.entries())
      .filter(([, queue]) => queue.length)
      .map(([platform, queue]) => ({ platform, next: queue[0] }))
      .sort((a, b) => b.next._rankScore - a.next._rankScore || a.next._sourceIndex - b.next._sourceIndex);

    if (!candidates.length) break;
    const selected = candidates.find((candidate) => candidate.platform !== lastPlatform) || candidates[0];
    const [next] = queues.get(selected.platform).splice(0, 1);
    mixed.push(next);
    lastPlatform = selected.platform;
  }

  return mixed.map(({ _rankScore, _sourceIndex, ...result }) => result);
}

async function searchPartsLive(input = {}, config = {}) {
  const page = Math.max(1, Number(input.page) || 1);
  const limit = Math.max(1, Math.min(30, Number(input.limit) || 10));
  const country = resolveSearchCountry(input);
  const errors = [];
  const searches = [];

  if (config.ebayClientId && config.ebayClientSecret) {
    searches.push(
      searchPartsWithEbay(input, config.ebayClientId, config.ebayClientSecret).catch((error) => {
        errors.push(`eBay: ${error.message}`);
        return null;
      }),
    );
  }

  if (config.serpApiKey) {
    searches.push(
      searchPartsWithSerpApi({ ...input, page: 1, limit: Math.min(30, Math.max(limit, page * limit)) }, config.serpApiKey).catch((error) => {
        errors.push(`SerpAPI: ${error.message}`);
        return null;
      }),
    );
  }

  if (!searches.length) {
    const error = new Error("No search provider is configured.");
    error.statusCode = 500;
    throw error;
  }

  const settled = (await Promise.all(searches)).filter(Boolean);
  if (!settled.length) {
    const error = new Error(errors[0] || "Search failed.");
    error.statusCode = 502;
    throw error;
  }

  const merged = rankAndMixResults(settled.flatMap((result) => result.allResults || result.results || []), input);
  const pagination = paginated(merged, page, limit);
  return {
    ...pagination,
    allResults: merged,
    query: settled[0].query || buildSearchQuery(input),
    provider: settled.map((result) => result.provider).join("+"),
    providerWarnings: errors,
    country: country.code,
    countryName: country.name,
  };
}

module.exports = {
  buildSearchQuery,
  resolveSearchCountry,
  searchPartsLive,
  searchPartsWithEbay,
  searchPartsWithSerpApi,
};
