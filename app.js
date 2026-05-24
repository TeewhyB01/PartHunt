import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported as analyticsIsSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtV479SVRsY_jYZLtlBjl-MOvGZ32U6yE",
  authDomain: "parthunt.firebaseapp.com",
  projectId: "parthunt",
  storageBucket: "parthunt.firebasestorage.app",
  messagingSenderId: "1089089473351",
  appId: "1:1089089473351:web:f136191bbbd131abdf5a62",
  measurementId: "G-W107HW9C4K",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
analyticsIsSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

const state = {
  user: null,
  mode: "partNumber",
  vehicle: {
    make: "Ford",
    model: "Focus",
    year: "2017",
    bodyType: "Hatchback",
  },
  selectedCategory: "Exterior",
  selectedPart: null,
  currentQuery: "",
  generatedQueries: [],
  results: [],
  filteredResults: [],
  savedParts: [],
  searchHistory: [],
  myReviews: [],
  publicReviews: [],
  platforms: [],
  activeHistoryId: null,
};

const trustedSources = ["BreakerLink", "Parts Gateway", "ASM Auto Recycling", "Synetiq", "1st Choice Spares"];

const parts = [
  {
    id: "front-bumper",
    name: "Front bumper",
    category: "Exterior",
    alternativeNames: ["Front bumper cover", "Front bumper assembly", "Front bumper skin", "Front valance"],
    description: "The front impact and trim panel. Check colour code, parking sensor holes, fog light shape, grille style, and facelift year.",
    compatibilityNotes: ["Confirm facelift or pre-facelift", "Check parking sensor cutouts", "Match body style", "Ask about cracks and mounts"],
    shape: "rect",
    x: 72,
    y: 268,
    width: 105,
    height: 48,
  },
  {
    id: "rear-bumper",
    name: "Rear bumper",
    category: "Exterior",
    alternativeNames: ["Rear bumper cover", "Rear bumper assembly", "Rear valance", "Rear bumper skin"],
    description: "The rear painted or textured bumper panel. Match parking sensors, exhaust cutout, and body style.",
    compatibilityNotes: ["Check exhaust cutout", "Confirm sensor holes", "Match hatchback/saloon/estate", "Inspect mounting tabs"],
    shape: "rect",
    x: 806,
    y: 268,
    width: 112,
    height: 48,
  },
  {
    id: "bonnet",
    name: "Bonnet",
    category: "Exterior",
    alternativeNames: ["Hood", "Engine lid", "Bonnet panel"],
    description: "The front upper body panel above the engine bay.",
    compatibilityNotes: ["Check colour code", "Confirm year range", "Inspect hinges and latch area", "Ask about dents"],
    shape: "polygon",
    points: "192,246 266,174 381,168 420,246",
  },
  {
    id: "boot-lid",
    name: "Boot lid",
    category: "Exterior",
    alternativeNames: ["Tailgate", "Trunk lid", "Rear hatch"],
    description: "The rear opening panel. Compatibility can depend on body type, camera, spoiler, and lights.",
    compatibilityNotes: ["Match body type", "Check reversing camera", "Confirm spoiler shape", "Ask about glass and wiring"],
    shape: "polygon",
    points: "704,244 790,246 852,263 806,188 724,174",
  },
  {
    id: "front-left-door",
    name: "Front left door",
    category: "Exterior",
    alternativeNames: ["Passenger front door", "Nearside front door", "Left front door shell"],
    description: "Front left door shell or complete door depending on listing.",
    compatibilityNotes: ["Confirm left/right side", "Check colour code", "Confirm mirror and handle included", "Match body style"],
    shape: "polygon",
    points: "422,168 539,169 552,246 398,246",
  },
  {
    id: "front-right-door",
    name: "Front right door",
    category: "Exterior",
    alternativeNames: ["Driver front door", "Offside front door", "Right front door shell"],
    description: "Front right door shell or complete door depending on listing.",
    compatibilityNotes: ["Confirm side", "Check colour and trim", "Inspect hinges", "Ask about window regulator"],
    shape: "polygon",
    points: "542,170 642,180 686,246 556,246",
  },
  {
    id: "headlights",
    name: "Headlights",
    category: "Exterior",
    alternativeNames: ["Headlamp", "Front light unit", "Headlight cluster"],
    description: "Front lighting unit. Side, beam type, and left-hand/right-hand drive matter.",
    compatibilityNotes: ["Confirm left or right", "Check halogen/xenon/LED", "Confirm LHD/RHD", "Inspect tabs and lens"],
    shape: "rect",
    x: 132,
    y: 238,
    width: 72,
    height: 24,
  },
  {
    id: "tail-lights",
    name: "Tail lights",
    category: "Exterior",
    alternativeNames: ["Rear light cluster", "Tail lamp", "Rear lamp"],
    description: "Rear light unit. Side and body style are important.",
    compatibilityNotes: ["Confirm side", "Match hatchback/saloon/estate", "Check inner or outer lamp", "Inspect cracks"],
    shape: "rect",
    x: 778,
    y: 238,
    width: 74,
    height: 24,
  },
  {
    id: "wing-mirrors",
    name: "Wing mirrors",
    category: "Exterior",
    alternativeNames: ["Door mirror", "Side mirror", "Mirror assembly"],
    description: "Door mirror assembly. Match side, folding, heating, indicator, and camera options.",
    compatibilityNotes: ["Confirm left or right", "Check power fold", "Check indicator type", "Match connector pins"],
    shape: "rect",
    x: 376,
    y: 218,
    width: 42,
    height: 24,
  },
  {
    id: "grille",
    name: "Grille",
    category: "Exterior",
    alternativeNames: ["Radiator grille", "Front grille", "Lower grille"],
    description: "Front grille or lower bumper grille depending on position.",
    compatibilityNotes: ["Confirm upper or lower grille", "Match bumper type", "Check chrome or black trim", "Inspect clips"],
    shape: "rect",
    x: 112,
    y: 286,
    width: 76,
    height: 30,
  },
  {
    id: "wheels",
    name: "Alloy wheels",
    category: "Exterior",
    alternativeNames: ["Wheel rim", "Alloys", "Road wheel"],
    description: "Wheel or alloy rim. Size, PCD, offset, and condition matter.",
    compatibilityNotes: ["Check wheel size", "Confirm PCD and offset", "Inspect cracks or buckles", "Ask whether tyre is included"],
    shape: "circle",
    cx: 234,
    cy: 326,
    r: 58,
  },
  {
    id: "engine",
    name: "Engine",
    category: "Engine bay",
    alternativeNames: ["Engine assembly", "Bare engine", "Complete engine", "Motor"],
    description: "Engine assembly. Confirm engine code, mileage, ancillaries, and warranty.",
    compatibilityNotes: ["Confirm engine code", "Ask mileage", "Check warranty", "Confirm included ancillaries"],
    shape: "rect",
    x: 284,
    y: 198,
    width: 124,
    height: 62,
  },
  {
    id: "battery",
    name: "Battery",
    category: "Engine bay",
    alternativeNames: ["Car battery", "12V battery", "Starter battery"],
    description: "Vehicle battery. Match size, rating, and start-stop requirement.",
    compatibilityNotes: ["Check battery type", "Match Ah and CCA", "Confirm start-stop support", "Check age"],
    shape: "rect",
    x: 430,
    y: 202,
    width: 72,
    height: 46,
  },
  {
    id: "radiator",
    name: "Radiator",
    category: "Engine bay",
    alternativeNames: ["Cooling radiator", "Engine radiator", "Rad pack"],
    description: "Cooling radiator. Confirm engine, transmission, and air conditioning setup.",
    compatibilityNotes: ["Match engine", "Check manual/automatic", "Inspect leaks", "Confirm AC condenser separate"],
    shape: "rect",
    x: 190,
    y: 216,
    width: 82,
    height: 50,
  },
  {
    id: "alternator",
    name: "Alternator",
    category: "Engine bay",
    alternativeNames: ["Generator", "Charging alternator"],
    description: "Charging system alternator. Match amperage and engine code.",
    compatibilityNotes: ["Confirm amp rating", "Match engine code", "Check pulley type", "Ask warranty"],
    shape: "circle",
    cx: 522,
    cy: 242,
    r: 30,
  },
  {
    id: "ecu",
    name: "ECU",
    category: "Engine bay",
    alternativeNames: ["Engine control unit", "Engine ECU", "Computer module"],
    description: "Engine control module. Often requires coding, matching numbers, or immobiliser work.",
    compatibilityNotes: ["Match part number", "Expect coding", "Confirm immobiliser set", "Check return policy"],
    shape: "rect",
    x: 556,
    y: 198,
    width: 72,
    height: 44,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    category: "Interior",
    alternativeNames: ["Dash", "Dashboard assembly", "Dash panel"],
    description: "Dashboard trim or assembly. Airbag and trim colour must be checked.",
    compatibilityNotes: ["Check airbag compatibility", "Match trim colour", "Confirm RHD/LHD", "Inspect mounting points"],
    shape: "rect",
    x: 326,
    y: 200,
    width: 160,
    height: 48,
  },
  {
    id: "seats",
    name: "Seats",
    category: "Interior",
    alternativeNames: ["Seat set", "Front seats", "Interior seats"],
    description: "Seat or interior set. Confirm airbags, heating, electric controls, and body type.",
    compatibilityNotes: ["Check airbag plugs", "Confirm heated/electric", "Match body type", "Inspect wear"],
    shape: "rect",
    x: 516,
    y: 194,
    width: 158,
    height: 72,
  },
  {
    id: "infotainment",
    name: "Infotainment screen",
    category: "Interior",
    alternativeNames: ["Radio display", "Navigation screen", "Head unit"],
    description: "Display or head unit. Coding and connector compatibility may be required.",
    compatibilityNotes: ["Match part number", "Check coding needs", "Confirm connectors", "Ask if security code included"],
    shape: "rect",
    x: 448,
    y: 208,
    width: 52,
    height: 34,
  },
  {
    id: "gearbox",
    name: "Gearbox",
    category: "Undercarriage",
    alternativeNames: ["Transmission", "Manual gearbox", "Automatic gearbox"],
    description: "Transmission assembly. Match engine code, gearbox code, and mileage.",
    compatibilityNotes: ["Confirm gearbox code", "Match engine", "Ask mileage", "Check warranty"],
    shape: "rect",
    x: 438,
    y: 292,
    width: 122,
    height: 48,
  },
  {
    id: "exhaust",
    name: "Exhaust",
    category: "Undercarriage",
    alternativeNames: ["Exhaust pipe", "Back box", "Exhaust system"],
    description: "Exhaust section. Check engine, body type, and emissions equipment.",
    compatibilityNotes: ["Confirm engine", "Check section needed", "Inspect corrosion", "Match body type"],
    shape: "rect",
    x: 570,
    y: 310,
    width: 226,
    height: 24,
  },
  {
    id: "catalytic-converter",
    name: "Catalytic converter",
    category: "Undercarriage",
    alternativeNames: ["Cat", "Catalyst", "Exhaust catalyst"],
    description: "Emissions component. Legal and emissions compliance must be checked.",
    compatibilityNotes: ["Confirm emissions standard", "Match engine", "Check legality", "Inspect damage"],
    shape: "rect",
    x: 596,
    y: 286,
    width: 92,
    height: 32,
  },
  {
    id: "brake-calipers",
    name: "Brake calipers",
    category: "Undercarriage",
    alternativeNames: ["Caliper", "Brake calliper", "Brake carrier"],
    description: "Brake caliper. Side, axle, and disc size matter.",
    compatibilityNotes: ["Confirm front/rear", "Confirm left/right", "Match disc size", "Inspect seized pistons"],
    shape: "circle",
    cx: 748,
    cy: 326,
    r: 42,
  },
];

const mockTemplates = [
  {
    source: "BreakerLink",
    location: "Birmingham",
    condition: "Used",
    delivery: true,
    price: 86,
    title: "{vehicle} {part} used replacement",
    description: "Breaker yard listing with compatibility notes, seller response estimate, and delivery available across the UK.",
    listingUrl: "https://www.breakerlink.com/",
    imageUrl: "",
    dateListed: "2026-05-21",
  },
  {
    source: "eBay",
    location: "Manchester",
    condition: "Scrap/breaker part",
    delivery: true,
    price: 74,
    title: "{vehicle} {part} breaker part with photos",
    description: "Marketplace-style listing. Check seller feedback, side of vehicle, and return policy before buying.",
    listingUrl: "https://www.ebay.co.uk/",
    imageUrl: "",
    dateListed: "2026-05-20",
  },
  {
    source: "Parts Gateway",
    location: "Leeds",
    condition: "Refurbished",
    delivery: true,
    price: 129,
    title: "{part} for {vehicle} tested used spare",
    description: "Supplier result with tested part notes and nationwide courier option.",
    listingUrl: "https://www.partsgateway.co.uk/",
    imageUrl: "",
    dateListed: "2026-05-19",
  },
  {
    source: "ASM Auto Recycling",
    location: "London",
    condition: "Used",
    delivery: false,
    price: 95,
    title: "{vehicle} {part} from dismantled vehicle",
    description: "Recycled part listing. Ask for extra photos of mounts, clips, and part number label.",
    listingUrl: "https://www.asm-autos.co.uk/",
    imageUrl: "",
    dateListed: "2026-05-18",
  },
  {
    source: "Synetiq",
    location: "Glasgow",
    condition: "New",
    delivery: true,
    price: 188,
    title: "{part} compatible with {vehicle}",
    description: "Salvage inventory style result. Confirm exact vehicle details before checkout.",
    listingUrl: "https://www.synetiq.co.uk/",
    imageUrl: "",
    dateListed: "2026-05-16",
  },
  {
    source: "1st Choice Spares",
    location: "Birmingham",
    condition: "Used",
    delivery: true,
    price: 63,
    title: "Affordable {part} quote for {vehicle}",
    description: "Quote-led spare part match from UK recyclers and breakers.",
    listingUrl: "https://www.1stchoice.co.uk/",
    imageUrl: "",
    dateListed: "2026-05-14",
  },
];

const demoPlatforms = [
  {
    id: "ebay",
    slug: "ebay",
    name: "eBay",
    category: "Online marketplace",
    categoryKey: "online_marketplace",
    websiteUrl: "https://www.ebay.co.uk/",
    averageRating: 4.3,
    reviewCount: 214,
    successfulPurchaseCount: 182,
    averageItemRating: 4.2,
    averageDeliveryRating: 4.1,
    wouldBuyAgainPercentage: 78,
    topPartCategories: ["Body panels", "Headlights", "Mirrors"],
    summary: "Wide choice and competitive prices, but condition varies by seller.",
    reviews: [
      { rating: 4, partName: "Wing mirror", text: "Good value and quick delivery. I had to double-check connector pins.", createdAt: "2026-05-20" },
      { rating: 5, partName: "Headlight", text: "Part arrived as photographed and fitted perfectly after matching the part number.", createdAt: "2026-05-18" },
    ],
  },
  {
    id: "breakerlink",
    slug: "breakerlink",
    name: "BreakerLink",
    category: "Breaker yard network",
    categoryKey: "breaker_yard",
    websiteUrl: "https://www.breakerlink.com/",
    averageRating: 4.5,
    reviewCount: 126,
    successfulPurchaseCount: 119,
    averageItemRating: 4.5,
    averageDeliveryRating: 4.3,
    wouldBuyAgainPercentage: 84,
    topPartCategories: ["Bumpers", "Gearboxes", "Doors"],
    summary: "Useful for getting quotes from multiple breakers without searching yard by yard.",
    reviews: [{ rating: 5, partName: "Front bumper", text: "Several quotes came back quickly and the seller confirmed sensor holes.", createdAt: "2026-05-17" }],
  },
  {
    id: "1st-choice-spares",
    slug: "1st-choice-spares",
    name: "1st Choice Spares",
    category: "Car parts retailer",
    categoryKey: "car_parts_retailer",
    websiteUrl: "https://www.1stchoice.co.uk/",
    averageRating: 4.1,
    reviewCount: 98,
    successfulPurchaseCount: 91,
    averageItemRating: 4.1,
    averageDeliveryRating: 4.0,
    wouldBuyAgainPercentage: 74,
    topPartCategories: ["Alternators", "ECUs", "Interior parts"],
    summary: "Good for quote-led searches, especially when exact part names are unclear.",
    reviews: [{ rating: 4, partName: "Alternator", text: "Correct amperage and fair price. Delivery took one extra day.", createdAt: "2026-05-16" }],
  },
  {
    id: "parts-gateway",
    slug: "parts-gateway",
    name: "Parts Gateway",
    category: "Specialist parts supplier",
    categoryKey: "specialist_parts_supplier",
    websiteUrl: "https://www.partsgateway.co.uk/",
    averageRating: 4.2,
    reviewCount: 87,
    successfulPurchaseCount: 76,
    averageItemRating: 4.2,
    averageDeliveryRating: 4.2,
    wouldBuyAgainPercentage: 80,
    topPartCategories: ["Engines", "Radiators", "Lights"],
    summary: "Strong for tested used parts and supplier-backed compatibility checks.",
    reviews: [{ rating: 4, partName: "Radiator", text: "Supplier asked for engine size before sending, which avoided a mismatch.", createdAt: "2026-05-15" }],
  },
  {
    id: "local-scrap-yard",
    slug: "local-scrap-yard",
    name: "Local Scrap Yard",
    category: "Scrap yard",
    categoryKey: "scrap_yard",
    websiteUrl: "",
    averageRating: 3.9,
    reviewCount: 64,
    successfulPurchaseCount: 58,
    averageItemRating: 4.0,
    averageDeliveryRating: 3.6,
    wouldBuyAgainPercentage: 68,
    topPartCategories: ["Wheels", "Doors", "Tail lights"],
    summary: "Best when users can inspect parts in person and confirm mounts or colour.",
    reviews: [{ rating: 4, partName: "Alloy wheel", text: "Collected same day. Needed careful inspection for kerb marks.", createdAt: "2026-05-14" }],
  },
  {
    id: "independent-breaker-yard",
    slug: "independent-breaker-yard",
    name: "Independent Breaker Yard",
    category: "Breaker yard",
    categoryKey: "breaker_yard",
    websiteUrl: "",
    averageRating: 4.0,
    reviewCount: 42,
    successfulPurchaseCount: 39,
    averageItemRating: 4.0,
    averageDeliveryRating: 3.9,
    wouldBuyAgainPercentage: 72,
    topPartCategories: ["Bonnet", "Seats", "Exhaust"],
    summary: "Often helpful for older vehicles and parts not listed on larger platforms.",
    reviews: [{ rating: 4, partName: "Seat set", text: "Good communication and sent extra photos before collection.", createdAt: "2026-05-13" }],
  },
];

const platformCategoryLabels = {
  online_marketplace: "Online marketplace",
  scrap_yard: "Scrap yard",
  breaker_yard: "Breaker yard",
  salvage_yard: "Salvage yard",
  car_parts_retailer: "Car parts retailer",
  independent_seller: "Independent seller",
  auction_platform: "Auction platform",
  local_garage: "Local garage",
  specialist_parts_supplier: "Specialist parts supplier",
  other: "Other",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 3200);
}

function getVehicleFromForm(prefix) {
  return {
    make: $(`#${prefix}Make`)?.value.trim() || "",
    model: $(`#${prefix}Model`)?.value.trim() || "",
    year: $(`#${prefix}Year`)?.value.trim() || "",
    trim: $(`#${prefix}Trim`)?.value.trim() || "",
    engineSize: $(`#${prefix}Engine`)?.value.trim() || "",
    fuelType: $(`#${prefix}Fuel`)?.value || "",
    transmission: $(`#${prefix}Transmission`)?.value || "",
    bodyType: $(`#${prefix}Body`)?.value || "",
  };
}

function vehicleLabel(vehicle = state.vehicle) {
  return [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "your vehicle";
}

function generateSearchQueries(input) {
  const queries = [];
  const vehicle = input.vehicle || {};
  const part = input.selectedPart;

  if (input.partNumber) {
    queries.push(`"${input.partNumber}"`);
    queries.push(`"${input.partNumber}" used car part`);
    queries.push(`"${input.partNumber}" breaker salvage`);
    if (vehicle.make || vehicle.model) {
      queries.push(`"${input.partNumber}" "${vehicle.make}" "${vehicle.model}" used`);
    }
  }

  if (vehicle.make && vehicle.model && part) {
    const base = `${vehicle.year || ""} ${vehicle.make} ${vehicle.model} ${part.name}`.trim();
    queries.push(`${base} used`);
    queries.push(`${base} breaker`);
    queries.push(`${base} scrap yard`);
    queries.push(`${base} replacement part`);
    part.alternativeNames.forEach((name) => {
      queries.push(`${vehicle.year || ""} ${vehicle.make} ${vehicle.model} ${name}`.trim());
    });
  }

  if (input.rawQuery) {
    queries.push(input.rawQuery);
  }

  return [...new Set(queries.filter(Boolean))];
}

function scoreResult(result, input) {
  const text = `${result.title} ${result.description}`.toLowerCase();
  const vehicle = input.vehicle || {};
  const part = input.selectedPart;
  let score = 30;

  if (input.partNumber && text.includes(input.partNumber.toLowerCase())) score += 40;
  if (vehicle.make && text.includes(vehicle.make.toLowerCase())) score += 10;
  if (vehicle.model && text.includes(vehicle.model.toLowerCase())) score += 10;
  if (vehicle.year && text.includes(String(vehicle.year))) score += 10;
  if (part?.name && text.includes(part.name.toLowerCase())) score += 15;
  if (part?.alternativeNames?.some((name) => text.includes(name.toLowerCase()))) score += 10;
  if (result.imageUrl) score += 5;
  if (result.price) score += 5;
  if (trustedSources.includes(result.source)) score += 10;
  if (!result.price || !result.condition) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function confidenceLabel(score) {
  if (score >= 78) return "High match";
  if (score >= 52) return "Possible match";
  return "Check carefully";
}

function createMockResults(input) {
  const vehicleText = vehicleLabel(input.vehicle);
  const partName = input.selectedPart?.name || input.rawQuery || "car part";
  const partNumberSuffix = input.partNumber ? ` ${input.partNumber}` : "";

  return mockTemplates.map((template, index) => {
    const result = {
      id: `${Date.now()}-${index}`,
      title: template.title.replace("{vehicle}", vehicleText).replace("{part}", partName) + partNumberSuffix,
      description: template.description,
      imageUrl: template.imageUrl,
      price: `£${template.price + index * 7}`,
      priceNumber: template.price + index * 7,
      currency: "GBP",
      source: template.source,
      location: template.location,
      condition: template.condition,
      compatibility: `${vehicleText}. Confirm exact part number, side, trim, and year range with seller.`,
      delivery: template.delivery,
      listingUrl: template.listingUrl,
      dateListed: template.dateListed,
      sellerRating: `${Math.max(91, 99 - index)}% positive`,
    };
    result.confidenceScore = scoreResult(result, input);
    result.confidenceLabel = confidenceLabel(result.confidenceScore);
    return result;
  });
}

async function searchParts(input) {
  state.generatedQueries = generateSearchQueries(input);
  state.currentQuery = state.generatedQueries[0] || input.rawQuery || "used car parts";
  const results = createMockResults(input).sort((a, b) => b.confidenceScore - a.confidenceScore);
  state.results = results;
  state.filteredResults = results;
  renderResults();
  await saveSearchHistory(input, results.length);
}

function searchTypeLabel(type) {
  return {
    part_number: "Part number",
    vehicle_part: "Interactive car selector",
    chat_assisted: "Chat-assisted search",
  }[type] || "Vehicle details";
}

function statusLabel(status) {
  return {
    still_looking: "Still looking",
    found_not_bought: "Found but not bought",
    bought: "Bought",
    could_not_find: "Could not find item",
    no_longer_needed: "No longer needed",
  }[status] || "Still looking";
}

function formatDate(value) {
  if (!value) return "Just now";
  if (value.toDate) return value.toDate().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function partNameFromHistory(item) {
  return item.selectedPart?.name || item.partNumber || item.rawQuery || "Car part";
}

async function saveSearchHistory(input, resultsCount) {
  if (!state.user) return;
  try {
    const historyDoc = {
      userId: state.user.uid,
      searchType: input.type || "vehicle_part",
      rawQuery: state.currentQuery,
      generatedSearchTerms: state.generatedQueries,
      vehicle: input.vehicle || null,
      selectedPart: input.selectedPart || null,
      partNumber: input.partNumber || null,
      resultsCount,
      purchaseStatus: "still_looking",
      savedResultIds: [],
      searchedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, "users", state.user.uid, "searchHistory"), historyDoc);
    state.activeHistoryId = ref.id;
    await addDoc(collection(db, "users", state.user.uid, "savedSearches"), {
      rawQuery: state.currentQuery,
      generatedQueries: state.generatedQueries,
      createdAt: serverTimestamp(),
    });
    await loadSearchHistory();
  } catch (error) {
    console.warn("Search history was not saved", error);
  }
}

function setMode(mode) {
  state.mode = mode;
  $$(".segment").forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  $$("[data-panel]").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.panel !== mode));
}

function renderDiagram() {
  const group = $("#diagramHotspots");
  group.innerHTML = "";
  parts
    .filter((part) => part.category === state.selectedCategory)
    .forEach((part) => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", part.shape);
      node.classList.add("part-hotspot");
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", part.name);
      node.dataset.partId = part.id;

      if (part.shape === "rect") {
        node.setAttribute("x", part.x);
        node.setAttribute("y", part.y);
        node.setAttribute("width", part.width);
        node.setAttribute("height", part.height);
        node.setAttribute("rx", "10");
      }
      if (part.shape === "circle") {
        node.setAttribute("cx", part.cx);
        node.setAttribute("cy", part.cy);
        node.setAttribute("r", part.r);
      }
      if (part.shape === "polygon") {
        node.setAttribute("points", part.points);
      }

      node.addEventListener("click", () => selectPart(part.id));
      node.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectPart(part.id);
        }
      });
      node.addEventListener("pointermove", (event) => showPartTooltip(event, part.name));
      node.addEventListener("pointerleave", hidePartTooltip);
      node.addEventListener("focus", (event) => showPartTooltip(event, part.name));
      node.addEventListener("blur", hidePartTooltip);
      group.appendChild(node);
    });

  if (!state.selectedPart || state.selectedPart.category !== state.selectedCategory) {
    selectPart(parts.find((part) => part.category === state.selectedCategory)?.id);
  } else {
    markSelectedHotspot();
  }
}

function showPartTooltip(event, text) {
  const tooltip = $("#partTooltip");
  const wrap = $(".diagram-wrap").getBoundingClientRect();
  const x = event.clientX ? event.clientX - wrap.left : 30;
  const y = event.clientY ? event.clientY - wrap.top : 30;
  tooltip.textContent = text;
  tooltip.style.left = `${Math.min(Math.max(x + 14, 10), wrap.width - 160)}px`;
  tooltip.style.top = `${Math.max(y - 42, 10)}px`;
  tooltip.classList.remove("hidden");
}

function hidePartTooltip() {
  $("#partTooltip").classList.add("hidden");
}

function selectPart(partId) {
  const part = parts.find((item) => item.id === partId);
  if (!part) return;
  state.selectedPart = part;
  $("#selectedPartName").textContent = part.name;
  $("#selectedPartDescription").textContent = part.description;
  $("#alternativeNames").innerHTML = part.alternativeNames.map((name) => `<li>${name}</li>`).join("");
  $("#compatibilityChecks").innerHTML = part.compatibilityNotes.map((note) => `<li>${note}</li>`).join("");
  markSelectedHotspot();
}

function markSelectedHotspot() {
  $$(".part-hotspot").forEach((node) => node.classList.toggle("active", node.dataset.partId === state.selectedPart?.id));
}

function renderResults() {
  $("#resultsTitle").textContent = state.currentQuery ? `Showing results for: ${state.currentQuery}` : "Showing popular used parts";
  $("#querySummary").textContent = state.generatedQueries.length
    ? `Generated ${state.generatedQueries.length} search terms: ${state.generatedQueries.slice(0, 3).join(" | ")}`
    : "Run a search to generate focused result cards.";
  applyFilters();
}

function applyFilters() {
  const maxPrice = Number($("#priceFilter").value);
  const location = $("#locationFilter").value;
  const source = $("#sourceFilter").value;
  const condition = $("#conditionFilter").value;
  const deliveryOnly = $("#deliveryFilter").checked;
  const exactOnly = $("#exactFilter").checked;
  const sort = $("#sortSelect").value;

  $("#priceValue").textContent = `Up to £${maxPrice}`;

  let results = state.results.filter((result) => {
    if (result.priceNumber > maxPrice) return false;
    if (location && result.location !== location) return false;
    if (source && result.source !== source) return false;
    if (condition && result.condition !== condition) return false;
    if (deliveryOnly && !result.delivery) return false;
    if (exactOnly && result.confidenceScore < 78) return false;
    return true;
  });

  if (sort === "price") results.sort((a, b) => a.priceNumber - b.priceNumber);
  if (sort === "newest") results.sort((a, b) => new Date(b.dateListed) - new Date(a.dateListed));
  if (sort === "nearest") {
    const order = ["London", "Birmingham", "Leeds", "Manchester", "Glasgow"];
    results.sort((a, b) => order.indexOf(a.location) - order.indexOf(b.location));
  }
  if (sort === "best") results.sort((a, b) => b.confidenceScore - a.confidenceScore);

  state.filteredResults = results;
  renderResultGrid($("#resultsGrid"), results, "results");
}

function renderResultGrid(container, results, context) {
  if (!results.length) {
    container.innerHTML = `<div class="empty-state">No matching parts yet. Try widening your filters or running a new search.</div>`;
    return;
  }

  container.innerHTML = results.map((result) => resultCardTemplate(result, context)).join("");
  container.querySelectorAll("[data-save-result]").forEach((button) => {
    button.addEventListener("click", () => savePart(button.dataset.saveResult));
  });
  container.querySelectorAll("[data-remove-result]").forEach((button) => {
    button.addEventListener("click", () => removeSavedPart(button.dataset.removeResult));
  });
  container.querySelectorAll("[data-ask-result]").forEach((button) => {
    const result = results.find((item) => item.id === button.dataset.askResult);
    button.addEventListener("click", () => {
      openChat();
      addMessage("assistant", `I can help check this listing: ${result.title}. Confirm part number, side of vehicle, condition, delivery cost, and return policy before buying.`);
    });
  });
}

function resultCardTemplate(result, context) {
  const confidenceClass = result.confidenceLabel === "High match" ? "" : result.confidenceLabel === "Possible match" ? "possible" : "careful";
  const image = result.imageUrl
    ? `<img src="${result.imageUrl}" alt="${result.title}" loading="lazy" />`
    : `<div class="result-image" aria-hidden="true">${result.source}</div>`;
  const saveOrRemove =
    context === "saved"
      ? `<button class="button button-ghost" type="button" data-remove-result="${result.savedDocId || result.id}">Remove</button>`
      : `<button class="button button-ghost" type="button" data-save-result="${result.id}">Save part</button>`;

  return `
    <article class="result-card">
      ${image}
      <div class="result-body">
        <div class="price">${result.price || "Price on request"}</div>
        <h3>${result.title}</h3>
        <p class="muted">${result.description}</p>
        <div class="result-meta">
          <span class="tag">${result.source}</span>
          <span class="tag">${result.location || "Unknown location"}</span>
          <span class="tag">${result.condition || "Condition unknown"}</span>
          <span class="tag">${result.delivery ? "Delivery" : "Collection"}</span>
          <span class="tag confidence ${confidenceClass}">${result.confidenceLabel}</span>
        </div>
        <p class="muted">${result.compatibility}</p>
        <div class="card-actions">
          <a class="button button-primary" href="${result.listingUrl}" target="_blank" rel="noopener noreferrer">View original listing</a>
          ${saveOrRemove}
          <button class="button button-secondary" type="button" data-ask-result="${result.id}">Ask agent</button>
        </div>
      </div>
    </article>
  `;
}

async function savePart(resultId) {
  const result = state.results.find((item) => item.id === resultId);
  if (!result) return;

  if (!state.user) {
    showToast("Sign in with Google to save parts to Firebase.");
    return;
  }

  try {
    const savedRef = doc(db, "users", state.user.uid, "savedParts", result.id);
    await setDoc(savedRef, {
      ...result,
      query: state.currentQuery,
      generatedQueries: state.generatedQueries,
      savedAt: serverTimestamp(),
    });
    if (state.activeHistoryId) {
      const active = state.searchHistory.find((item) => item.id === state.activeHistoryId);
      const ids = new Set(active?.savedResultIds || []);
      ids.add(result.id);
      await updateDoc(doc(db, "users", state.user.uid, "searchHistory", state.activeHistoryId), {
        savedResultIds: Array.from(ids),
        updatedAt: serverTimestamp(),
      });
    }
    showToast("Part saved to Firebase.");
    await loadSavedParts();
    await loadSearchHistory();
  } catch (error) {
    console.error(error);
    showToast("Could not save part. Check your Firebase rules.");
  }
}

async function removeSavedPart(savedDocId) {
  if (!state.user) return;
  try {
    await deleteDoc(doc(db, "users", state.user.uid, "savedParts", savedDocId));
    showToast("Saved part removed.");
    await loadSavedParts();
  } catch (error) {
    console.error(error);
    showToast("Could not remove saved part.");
  }
}

async function loadSavedParts() {
  if (!state.user) {
    state.savedParts = [];
    renderSavedParts();
    return;
  }

  try {
    const savedQuery = query(collection(db, "users", state.user.uid, "savedParts"), orderBy("savedAt", "desc"));
    const snapshot = await getDocs(savedQuery);
    state.savedParts = snapshot.docs.map((item) => ({ ...item.data(), savedDocId: item.id }));
    renderSavedParts();
  } catch (error) {
    console.error(error);
    renderSavedParts("Saved parts could not be loaded. If this is your first run, deploy the included Firestore rules.");
  }
}

function renderSavedParts(message) {
  $("#savedCountHero").textContent = String(state.savedParts.length);
  $("#savedCountDashboard").textContent = String(state.savedParts.length);
  const container = $("#savedGrid");
  if (message) {
    container.innerHTML = `<div class="empty-state">${message}</div>`;
    return;
  }
  if (!state.user) {
    container.innerHTML = `<div class="empty-state">Google sign in is required before saved parts can sync with Firebase.</div>`;
    return;
  }
  renderResultGrid(container, state.savedParts, "saved");
}

async function saveCurrentSearch() {
  if (!state.user) {
    showToast("Sign in with Google to save searches to Firebase.");
    return;
  }
  if (!state.currentQuery) {
    showToast("Run a search first.");
    return;
  }
  try {
    await addDoc(collection(db, "users", state.user.uid, "savedSearches"), {
      rawQuery: state.currentQuery,
      generatedQueries: state.generatedQueries,
      createdAt: serverTimestamp(),
    });
    showToast("Search saved.");
  } catch (error) {
    console.error(error);
    showToast("Could not save search.");
  }
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function initials(value) {
  return value.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

function stars(rating) {
  const rounded = Math.round(Number(rating) || 0);
  return `${"★".repeat(rounded)}${"☆".repeat(Math.max(0, 5 - rounded))}`;
}

function mergePlatforms() {
  const platformMap = new Map(demoPlatforms.map((platform) => [platform.id, { ...platform, reviews: [...platform.reviews], isDemo: true }]));

  const reviewPool = [...state.publicReviews, ...state.myReviews].filter((review, index, list) => {
    const key = review.id || `${review.userId}_${review.searchHistoryId}`;
    return list.findIndex((item) => (item.id || `${item.userId}_${item.searchHistoryId}`) === key) === index;
  });

  reviewPool.forEach((review) => {
    const platformId = review.platformId || slugify(review.platformName || "Other");
    const current = platformMap.get(platformId) || {
      id: platformId,
      slug: platformId,
      name: review.platformName || "Other",
      category: platformCategoryLabels[review.platformCategory] || "Other",
      categoryKey: review.platformCategory || "other",
      websiteUrl: review.websiteUrl || "",
      averageRating: 0,
      reviewCount: 0,
      successfulPurchaseCount: 0,
      averageItemRating: 0,
      averageDeliveryRating: 0,
      wouldBuyAgainPercentage: 0,
      topPartCategories: [],
      summary: "User-created platform from verified PartHunt search history.",
      reviews: [],
      isDemo: false,
    };
    current.reviews.push({
      rating: review.overallRating,
      itemRating: review.itemRating,
      deliveryRating: review.deliveryRating,
      partName: review.partName,
      text: review.reviewText || "No written review.",
      createdAt: review.createdAt,
      wouldBuyAgain: review.wouldBuyAgain,
      vehicle: [review.vehicleYear, review.vehicleMake, review.vehicleModel].filter(Boolean).join(" "),
    });
    current.topPartCategories = [...new Set([...current.topPartCategories, review.partName].filter(Boolean))].slice(0, 4);
    platformMap.set(platformId, current);
  });

  const merged = Array.from(platformMap.values()).map((platform) => {
    const realReviews = platform.reviews || [];
    const ratings = realReviews.map((review) => Number(review.rating)).filter(Boolean);
    const itemRatings = realReviews.map((review) => Number(review.itemRating || review.rating)).filter(Boolean);
    const deliveryRatings = realReviews.map((review) => Number(review.deliveryRating)).filter(Boolean);
    const buyAgain = realReviews.filter((review) => review.wouldBuyAgain === true).length;
    const ratingAvg = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : platform.averageRating;
    return {
      ...platform,
      averageRating: Number(ratingAvg.toFixed(1)),
      averageItemRating: itemRatings.length ? Number((itemRatings.reduce((sum, value) => sum + value, 0) / itemRatings.length).toFixed(1)) : platform.averageItemRating,
      averageDeliveryRating: deliveryRatings.length ? Number((deliveryRatings.reduce((sum, value) => sum + value, 0) / deliveryRatings.length).toFixed(1)) : platform.averageDeliveryRating,
      reviewCount: Math.max(platform.reviewCount || 0, realReviews.length),
      successfulPurchaseCount: (platform.successfulPurchaseCount || 0) + reviewPool.filter((review) => (review.platformId || slugify(review.platformName || "")) === platform.id).length,
      wouldBuyAgainPercentage: realReviews.length ? Math.round((buyAgain / realReviews.length) * 100) : platform.wouldBuyAgainPercentage,
    };
  });

  state.platforms = merged.sort((a, b) => b.successfulPurchaseCount - a.successfulPurchaseCount || b.averageRating - a.averageRating).slice(0, 10);
}

function renderPlatforms() {
  mergePlatforms();
  const grid = $("#platformGrid");
  grid.innerHTML = state.platforms
    .map((platform) => `
      <article class="platform-card">
        <div class="platform-logo" aria-hidden="true">${initials(platform.name)}</div>
        <div>
          <h3>${platform.name}</h3>
          <p class="muted">${platform.category}</p>
        </div>
        <div><span class="stars">${stars(platform.averageRating)}</span> <strong>${platform.averageRating}/5</strong></div>
        <div class="result-meta">
          <span class="tag">${platform.reviewCount} reviews</span>
          <span class="tag">${platform.successfulPurchaseCount} purchases</span>
        </div>
        <p class="muted">Popular for: ${platform.topPartCategories.join(", ")}</p>
        <p>${platform.summary}</p>
        <a class="button button-secondary" href="#platform-${platform.slug}">View Platform</a>
      </article>
    `)
    .join("");
}

function renderPlatformProfile(slug) {
  const platform = state.platforms.find((item) => item.slug === slug) || demoPlatforms.find((item) => item.slug === slug);
  const section = $("#platform-profile");
  if (!platform) {
    section.classList.add("hidden");
    return;
  }
  section.classList.remove("hidden");
  const reviews = platform.reviews || [];
  const counts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => Math.round(Number(review.rating)) === rating).length,
  }));
  const total = Math.max(reviews.length, 1);
  $("#platformProfileContent").innerHTML = `
    <article class="platform-profile-card">
      <div class="platform-profile-header">
        <div>
          <div class="platform-logo" aria-hidden="true">${initials(platform.name)}</div>
          <p class="eyebrow">Platform profile</p>
          <h2>${platform.name}</h2>
          <p class="muted">${platform.category}</p>
        </div>
        <div>
          <div class="stars">${stars(platform.averageRating)}</div>
          <strong>${platform.averageRating}/5 from ${platform.reviewCount} reviews</strong>
          <p class="muted">${platform.successfulPurchaseCount} successful purchases recorded</p>
        </div>
      </div>
      <div class="result-meta">
        <span class="tag">Item rating ${platform.averageItemRating || platform.averageRating}/5</span>
        <span class="tag">Delivery rating ${platform.averageDeliveryRating || "N/A"}/5</span>
        <span class="tag">${platform.wouldBuyAgainPercentage || 0}% would buy again</span>
      </div>
      <p>${platform.summary}</p>
      <p class="muted">Users commonly buy ${platform.topPartCategories.join(", ")} from this platform. Check exact part number, side, condition, and return policy before buying.</p>
      ${platform.websiteUrl ? `<a class="button button-primary" href="${platform.websiteUrl}" target="_blank" rel="noopener noreferrer">Visit website</a>` : ""}
      <h3>Rating breakdown</h3>
      ${counts.map((row) => `
        <div class="breakdown-row">
          <span>${row.rating} stars</span>
          <div class="breakdown-bar"><span style="width: ${(row.count / total) * 100}%"></span></div>
          <span>${Math.round((row.count / total) * 100)}%</span>
        </div>
      `).join("")}
      <h3>Recent user feedback</h3>
      <div class="review-list">
        ${reviews.map((review) => `
          <article class="review-card">
            <div class="stars">${stars(review.rating)}</div>
            <strong>${review.partName || "Car part"} ${review.vehicle ? `for ${review.vehicle}` : ""}</strong>
            <p>${review.text || "No written review."}</p>
            <p class="muted">${formatDate(review.createdAt)}</p>
          </article>
        `).join("")}
      </div>
    </article>
  `;
}

function handleHashRoute() {
  const hash = location.hash.replace("#", "");
  if (hash.startsWith("platform-")) {
    renderPlatformProfile(hash.replace("platform-", ""));
    $("#platform-profile").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function ensureUserProfile() {
  if (!state.user) return;
  await setDoc(doc(db, "users", state.user.uid), {
    id: state.user.uid,
    name: state.user.displayName || "",
    email: state.user.email || "",
    avatarUrl: state.user.photoURL || "",
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

async function loadSearchHistory() {
  if (!state.user) {
    state.searchHistory = [];
    renderHistory();
    return;
  }
  try {
    const historyQuery = query(collection(db, "users", state.user.uid, "searchHistory"), orderBy("searchedAt", "desc"));
    const snapshot = await getDocs(historyQuery);
    state.searchHistory = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    renderHistory();
  } catch (error) {
    console.error(error);
    $("#historyGrid").innerHTML = `<div class="empty-state">Search history could not be loaded. Deploy the updated Firestore rules if this is your first run.</div>`;
  }
}

async function loadMyReviews() {
  if (!state.user) {
    state.myReviews = [];
    renderMyReviews();
    renderPlatforms();
    return;
  }
  try {
    const reviewQuery = query(collection(db, "users", state.user.uid, "platformReviews"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(reviewQuery);
    state.myReviews = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    renderMyReviews();
    renderPlatforms();
  } catch (error) {
    console.error(error);
    renderMyReviews("Reviews could not be loaded.");
  }
}

async function loadPublicReviews() {
  try {
    const reviewQuery = query(collection(db, "platformReviews"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(reviewQuery);
    state.publicReviews = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    renderPlatforms();
  } catch (error) {
    state.publicReviews = [];
    renderPlatforms();
  }
}

function renderHistory() {
  $("#historyCount").textContent = String(state.searchHistory.length);
  $("#boughtCount").textContent = String(state.searchHistory.filter((item) => item.purchaseStatus === "bought").length);
  const grid = $("#historyGrid");
  if (!state.user) {
    grid.innerHTML = `<div class="empty-state">Sign in with Google to save search history and track purchases.</div>`;
    return;
  }
  if (!state.searchHistory.length) {
    grid.innerHTML = `<div class="empty-state">No search history yet. Run a search while signed in and it will appear here.</div>`;
    return;
  }
  grid.innerHTML = state.searchHistory.map((item) => `
    <article class="history-card">
      <div class="history-card-header">
        <div>
          <p class="eyebrow">Search: ${partNameFromHistory(item)}</p>
          <h3>${item.rawQuery}</h3>
        </div>
        <span class="status-badge">${statusLabel(item.purchaseStatus)}</span>
      </div>
      <div class="result-meta">
        <span class="tag">${formatDate(item.searchedAt)}</span>
        <span class="tag">${searchTypeLabel(item.searchType)}</span>
        <span class="tag">${item.resultsCount || 0} results</span>
        <span class="tag">${vehicleLabel(item.vehicle || {})}</span>
      </div>
      ${item.boughtFromPlatformName ? `<p><strong>Platform:</strong> ${item.boughtFromPlatformName}</p>` : ""}
      ${item.itemRating ? `<p><strong>Item rating:</strong> <span class="stars">${stars(item.itemRating)}</span> ${item.deliveryRating ? `Delivery: <span class="stars">${stars(item.deliveryRating)}</span>` : ""}</p>` : ""}
      ${item.reviewText ? `<p class="muted">${item.reviewText}</p>` : ""}
      <div class="history-card-actions">
        <button class="button button-secondary" type="button" data-view-history="${item.id}">View Results</button>
        <button class="button button-primary" type="button" data-update-history="${item.id}">${item.purchaseStatus === "bought" ? "Edit Review" : "Update Status"}</button>
      </div>
    </article>
  `).join("");
  grid.querySelectorAll("[data-update-history]").forEach((button) => button.addEventListener("click", () => openPurchaseModal(button.dataset.updateHistory)));
  grid.querySelectorAll("[data-view-history]").forEach((button) => button.addEventListener("click", () => {
    const item = state.searchHistory.find((history) => history.id === button.dataset.viewHistory);
    if (!item) return;
    state.currentQuery = item.rawQuery;
    state.generatedQueries = item.generatedSearchTerms || [];
    state.results = createMockResults({
      vehicle: item.vehicle,
      selectedPart: item.selectedPart,
      partNumber: item.partNumber,
      rawQuery: item.rawQuery,
    });
    renderResults();
    location.hash = "results";
  }));
}

function renderMyReviews(message) {
  $("#reviewCount").textContent = String(state.myReviews.length);
  const grid = $("#myReviewsGrid");
  if (message) {
    grid.innerHTML = `<div class="empty-state">${message}</div>`;
    return;
  }
  if (!state.user) {
    grid.innerHTML = `<div class="empty-state">Sign in to see reviews linked to your verified search history.</div>`;
    return;
  }
  if (!state.myReviews.length) {
    grid.innerHTML = `<div class="empty-state">No reviews yet. Mark a history item as bought to leave your first review.</div>`;
    return;
  }
  grid.innerHTML = state.myReviews.map((review) => `
    <article class="history-card">
      <div class="history-card-header">
        <div>
          <p class="eyebrow">${review.platformName}</p>
          <h3>${review.partName}</h3>
        </div>
        <span class="stars">${stars(review.overallRating)}</span>
      </div>
      <p>${review.reviewText || "No written review."}</p>
      <p class="muted">${formatDate(review.createdAt)} ${review.wouldBuyAgain ? "· Would buy again" : ""}</p>
    </article>
  `).join("");
}

function populatePlatformSelect() {
  const options = [...demoPlatforms.map((platform) => `<option value="${platform.id}">${platform.name}</option>`), `<option value="other">Other / custom</option>`];
  $("#purchasePlatform").innerHTML = options.join("");
}

function toggleBoughtFields() {
  const isBought = $("#purchaseStatus").value === "bought";
  $$(".bought-field").forEach((field) => field.classList.toggle("hidden", !isBought));
  $(".delivery-rating-field").classList.toggle("hidden", !isBought || !$("#purchaseDeliveryRequired").checked);
}

function openPurchaseModal(historyId) {
  const item = state.searchHistory.find((history) => history.id === historyId);
  if (!item) return;
  state.activeHistoryId = historyId;
  $("#purchaseHistoryId").value = historyId;
  $("#purchaseModalTitle").textContent = `Update: ${partNameFromHistory(item)}`;
  $("#purchaseStatus").value = item.purchaseStatus || "still_looking";
  $("#purchasePlatform").value = item.boughtFromPlatformId || demoPlatforms[0].id;
  $("#customPlatformName").value = item.boughtFromPlatformName && !demoPlatforms.some((platform) => platform.id === item.boughtFromPlatformId) ? item.boughtFromPlatformName : "";
  $("#purchaseListingUrl").value = item.listingUrl || "";
  $("#purchasePricePaid").value = item.pricePaid || "";
  $("#purchaseCondition").value = item.itemCondition || "unknown";
  $("#purchaseDeliveryRequired").checked = Boolean(item.deliveryRequired);
  $("#itemRating").value = item.itemRating || "5";
  $("#deliveryRating").value = item.deliveryRating || "";
  $("#reviewText").value = item.reviewText || "";
  $("#wouldBuyAgain").checked = item.wouldBuyAgain !== false;
  toggleBoughtFields();
  $("#purchaseModal").classList.remove("hidden");
}

function closePurchaseModal() {
  $("#purchaseModal").classList.add("hidden");
}

async function savePurchaseStatus(event) {
  event.preventDefault();
  if (!state.user) {
    showToast("Sign in to update purchase history.");
    return;
  }
  const historyId = $("#purchaseHistoryId").value;
  const historyItem = state.searchHistory.find((item) => item.id === historyId);
  if (!historyItem) return;
  const purchaseStatus = $("#purchaseStatus").value;
  const selectedPlatformId = $("#purchasePlatform").value;
  const demoPlatform = demoPlatforms.find((platform) => platform.id === selectedPlatformId);
  const customName = $("#customPlatformName").value.trim();
  const platformName = selectedPlatformId === "other" ? customName || "Other" : demoPlatform.name;
  const platformId = selectedPlatformId === "other" ? slugify(platformName) : demoPlatform.id;
  const platformCategory = selectedPlatformId === "other" ? $("#customPlatformCategory").value : demoPlatform.categoryKey;
  const deliveryRequired = $("#purchaseDeliveryRequired").checked;
  const itemRating = Number($("#itemRating").value);
  const deliveryRating = deliveryRequired && $("#deliveryRating").value ? Number($("#deliveryRating").value) : null;
  const overallRating = deliveryRating ? Number(((itemRating + deliveryRating) / 2).toFixed(1)) : itemRating;
  const update = {
    purchaseStatus,
    updatedAt: serverTimestamp(),
  };

  if (purchaseStatus === "bought") {
    Object.assign(update, {
      boughtFromPlatformId: platformId,
      boughtFromPlatformName: platformName,
      platformCategory,
      listingUrl: $("#purchaseListingUrl").value.trim(),
      pricePaid: Number($("#purchasePricePaid").value) || null,
      itemCondition: $("#purchaseCondition").value,
      deliveryRequired,
      itemRating,
      deliveryRating,
      platformRating: overallRating,
      reviewText: $("#reviewText").value.trim(),
      wouldBuyAgain: $("#wouldBuyAgain").checked,
      dateBought: new Date().toISOString(),
    });
  }

  try {
    await updateDoc(doc(db, "users", state.user.uid, "searchHistory", historyId), update);
    if (purchaseStatus === "bought") {
      const review = {
        userId: state.user.uid,
        platformId,
        platformName,
        platformCategory,
        searchHistoryId: historyId,
        partName: partNameFromHistory(historyItem),
        vehicleMake: historyItem.vehicle?.make || "",
        vehicleModel: historyItem.vehicle?.model || "",
        vehicleYear: Number(historyItem.vehicle?.year) || null,
        itemRating,
        deliveryRating,
        overallRating,
        reviewText: $("#reviewText").value.trim(),
        boughtItem: true,
        wouldBuyAgain: $("#wouldBuyAgain").checked,
        listingUrl: $("#purchaseListingUrl").value.trim(),
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", state.user.uid, "platformReviews", historyId), review);
      await setDoc(doc(db, "platformReviews", `${state.user.uid}_${historyId}`), review);
    }
    closePurchaseModal();
    showToast("Purchase status saved.");
    await loadSearchHistory();
    await loadMyReviews();
  } catch (error) {
    console.error(error);
    showToast("Could not save status. Check Firestore rules.");
  }
}

function emailAuthValues() {
  return {
    email: $("#authEmail").value.trim(),
    password: $("#authPassword").value,
  };
}

async function signInWithEmail(event) {
  event.preventDefault();
  const { email, password } = emailAuthValues();
  if (!email || !password) {
    showToast("Enter your email and password.");
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Signed in.");
  } catch (error) {
    console.error(error);
    showToast("Email sign in failed. Check the account details.");
  }
}

async function signUpWithEmail() {
  const { email, password } = emailAuthValues();
  if (!email || password.length < 6) {
    showToast("Enter an email and a password with at least 6 characters.");
    return;
  }
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showToast("Account created.");
  } catch (error) {
    console.error(error);
    showToast("Could not create account. Check Firebase email/password auth is enabled.");
  }
}

async function resetPassword() {
  const email = $("#authEmail").value.trim();
  if (!email) {
    showToast("Enter your email first.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Password reset email sent.");
  } catch (error) {
    console.error(error);
    showToast("Could not send reset email.");
  }
}

function openChat() {
  $("#chatbox").classList.remove("hidden");
  $("#chatToggle").classList.add("hidden");
  $("#chatInput").focus();
}

function closeChat() {
  $("#chatbox").classList.add("hidden");
  $("#chatToggle").classList.remove("hidden");
}

function addMessage(role, content) {
  const messages = $("#chatMessages");
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.innerHTML = `<strong>${role === "user" ? "You" : "PartHunt Agent"}</strong>${content}`;
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;
}

function assistantReply(text) {
  const lower = text.toLowerCase();
  if (lower.includes("plastic") || lower.includes("under") || lower.includes("cover")) {
    return "That could be an engine undertray, splash shield, lower engine cover, or front valance. What is the make, model, year, and where under the car is it located?";
  }
  if (lower.includes("mirror")) {
    return "For a wing mirror, confirm left or right side, power-folding, heated glass, indicator type, camera, and connector pins. If you share make, model, and year, I can create a tighter search.";
  }
  if (lower.includes("ecu")) {
    return "For an ECU, exact part number matters. It may require coding or an immobiliser set, so check the seller return policy and whether programming is included.";
  }
  if (lower.includes("bumper")) {
    return "For bumpers, check facelift year, colour code, parking sensors, fog lights, washer jets, grille shape, and whether it is a cover or complete assembly.";
  }
  if (lower.includes("search")) {
    return `I would search: ${state.generatedQueries.slice(0, 3).join(" | ") || "year make model part name used breaker"}. Always confirm part number, side, condition, delivery cost, and return policy.`;
  }
  return "Tell me the make, model, year, and where the part sits on the vehicle. If the part name is vague, I’ll suggest likely names and a safer search query.";
}

async function uploadPhoto(event) {
  event.preventDefault();
  const status = $("#uploadStatus");
  const file = $("#partPhoto").files[0];
  if (!state.user) {
    status.textContent = "Sign in with Google before uploading.";
    return;
  }
  if (!file) {
    status.textContent = "Choose an image first.";
    return;
  }

  try {
    status.textContent = "Uploading...";
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
    const fileRef = ref(storage, `users/${state.user.uid}/part-photos/${Date.now()}-${safeName}`);
    await uploadBytes(fileRef, file, { contentType: file.type });
    const url = await getDownloadURL(fileRef);
    await addDoc(collection(db, "users", state.user.uid, "uploads"), {
      name: file.name,
      url,
      contentType: file.type,
      createdAt: serverTimestamp(),
    });
    status.innerHTML = `Uploaded. <a href="${url}" target="_blank" rel="noopener noreferrer">Open photo</a>`;
  } catch (error) {
    console.error(error);
    status.textContent = "Upload failed. Check Firebase Storage rules and CORS settings.";
  }
}

function wireEvents() {
  $$(".segment").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $$(".vehicle-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedCategory = button.dataset.category;
      $$(".vehicle-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
      renderDiagram();
    });
  });

  $("#partNumberForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const vehicle = getVehicleFromForm("part");
    state.vehicle = { ...state.vehicle, ...vehicle };
    searchParts({
      type: "part_number",
      partNumber: $("#partNumber").value.trim(),
      vehicle,
      rawQuery: $("#partNumber").value.trim(),
    });
    location.hash = "results";
  });

  $("#vehicleForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.vehicle = getVehicleFromForm("vehicle");
    setMode("selector");
    location.hash = "selector";
    showToast("Vehicle saved. Pick a part from the diagram.");
  });

  $("#searchSelectedPart").addEventListener("click", () => {
    searchParts({
      type: "vehicle_part",
      vehicle: state.vehicle,
      selectedPart: state.selectedPart,
      rawQuery: `${vehicleLabel()} ${state.selectedPart.name} used`,
    });
    location.hash = "results";
  });

  ["priceFilter", "locationFilter", "sourceFilter", "conditionFilter", "deliveryFilter", "exactFilter", "sortSelect"].forEach((id) => {
    $(`#${id}`).addEventListener("input", applyFilters);
    $(`#${id}`).addEventListener("change", applyFilters);
  });

  $("#signInButton").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error(error);
      showToast("Google sign in did not complete. Check authorized domains in Firebase.");
    }
  });
  $("#signOutButton").addEventListener("click", () => signOut(auth));
  $("#dashboardSignInButton").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error(error);
      showToast("Google sign in did not complete.");
    }
  });
  $("#settingsSignOutButton").addEventListener("click", () => signOut(auth));
  $("#saveSearchButton").addEventListener("click", saveCurrentSearch);
  $("#refreshSavedButton").addEventListener("click", loadSavedParts);
  $("#refreshHistoryButton").addEventListener("click", loadSearchHistory);
  $("#clearLocalButton").addEventListener("click", () => showToast("This version syncs saved parts with Firebase, so there is no local cache to clear."));
  $("#uploadForm").addEventListener("submit", uploadPhoto);
  $("#emailAuthForm").addEventListener("submit", signInWithEmail);
  $("#emailSignUpButton").addEventListener("click", signUpWithEmail);
  $("#resetPasswordButton").addEventListener("click", resetPassword);
  $("#purchaseForm").addEventListener("submit", savePurchaseStatus);
  $("#purchaseStatus").addEventListener("change", toggleBoughtFields);
  $("#purchaseDeliveryRequired").addEventListener("change", toggleBoughtFields);
  $("#purchaseModalClose").addEventListener("click", closePurchaseModal);
  $("#purchaseCancelButton").addEventListener("click", closePurchaseModal);
  window.addEventListener("hashchange", handleHashRoute);

  $("#chatToggle").addEventListener("click", openChat);
  $("#chatClose").addEventListener("click", closeChat);
  $("#heroAskButton").addEventListener("click", openChat);
  $("#chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#chatInput");
    const text = input.value.trim();
    if (!text) return;
    addMessage("user", text);
    input.value = "";
    window.setTimeout(() => addMessage("assistant", assistantReply(text)), 350);
  });
}

function seedInitialResults() {
  const initialPart = parts.find((part) => part.id === "front-bumper");
  state.selectedPart = initialPart;
  const input = {
    type: "vehicle_part",
    vehicle: state.vehicle,
    selectedPart: initialPart,
    rawQuery: "2017 Ford Focus front bumper used",
  };
  state.generatedQueries = generateSearchQueries(input);
  state.currentQuery = input.rawQuery;
  state.results = createMockResults(input).sort((a, b) => b.confidenceScore - a.confidenceScore);
  state.filteredResults = state.results;
  renderResults();
}

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  $("#signInButton").classList.toggle("hidden", Boolean(user));
  $("#signOutButton").classList.toggle("hidden", !user);
  $("#dashboardSignInButton").classList.toggle("hidden", Boolean(user));
  $("#emailAuthForm").classList.toggle("hidden", Boolean(user));
  $("#userStatus").textContent = user ? user.email || user.displayName || "Signed in" : "Not signed in";
  $("#accountName").textContent = user ? user.displayName || "PartHunt user" : "Guest user";
  $("#accountEmail").textContent = user ? user.email || "Signed in with Google" : "Sign in to sync searches and reviews.";
  $("#settingsEmail").textContent = user ? user.email || "Signed in with Google" : "Not signed in";
  $("#settingsUid").textContent = user ? user.uid : "Not available";
  if (user) await ensureUserProfile();
  await loadSavedParts();
  await loadSearchHistory();
  await loadMyReviews();
  await loadPublicReviews();
});

wireEvents();
populatePlatformSelect();
renderDiagram();
selectPart("front-bumper");
seedInitialResults();
renderPlatforms();
renderHistory();
renderMyReviews();
handleHashRoute();
addMessage("assistant", "Hi, I can help identify parts, suggest alternative names, and build safer search queries. What car and part are you looking for?");
