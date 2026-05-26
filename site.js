import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { demoPlatforms, demoResults, firebaseConfig, parts, popularVehicleMakes, popularVehicleVariants } from "/site-data.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const page = document.body.dataset.page;
let currentUser = null;
let pendingRedirectAfterAuth = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function initials(value) {
  return value.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

function stars(rating) {
  const rounded = Math.round(Number(rating) || 0);
  return `${"★".repeat(rounded)}${"☆".repeat(Math.max(0, 5 - rounded))}`;
}

function starRating(rating, showNumber = true) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.floor(value);
  const halfStar = value - fullStars >= 0.5;
  const symbols = Array.from({ length: 5 }, (_, index) => {
    if (index < fullStars) return "★";
    if (index === fullStars && halfStar) return "★";
    return "☆";
  }).join("");
  return `<span class="star-rating" aria-label="${value.toFixed(1)} out of 5 stars"><span>${symbols}</span>${showNumber ? `<strong>${value.toFixed(1)}/5</strong>` : ""}</span>`;
}

function setTheme(theme) {
  const next = theme || localStorage.getItem("parthunt-theme") || "light";
  document.documentElement.dataset.theme = next;
  document.body.dataset.theme = next;
  localStorage.setItem("parthunt-theme", next);
  $$(".theme-toggle").forEach((button) => {
    button.textContent = next === "dark" ? "☀" : "☾";
    button.setAttribute("aria-label", next === "dark" ? "Switch to light mode" : "Switch to dark mode");
  });
}

function renderShell() {
  $("#siteNav").innerHTML = `
    <header class="site-header">
      <a class="brand" href="/" aria-label="PartHunt AI home">
        <span class="brand-mark" aria-hidden="true">PH</span>
        <span><strong>PartHunt AI</strong><small>Scrap part finder</small></span>
      </a>
      <nav class="top-nav" aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/search/part-number/">Search Part Number</a>
        <a href="/search/vehicle/">Search Vehicle</a>
        <a href="/platforms/">View Platform Reviews</a>
      </nav>
      <div class="auth-zone">
        <button class="theme-icon-button theme-toggle" type="button" aria-label="Toggle dark mode">☾</button>
        <a id="navSignIn" class="button button-ghost" href="/sign-in/">Sign In</a>
        <a id="navSignUp" class="button button-primary" href="/sign-up/">Create Account</a>
        <div id="accountMenu" class="account-menu hidden">
          <button id="accountMenuButton" class="account-menu-button" type="button" aria-haspopup="true" aria-expanded="false">
            <span class="account-user-icon" aria-hidden="true">${categoryIcon("independent_seller")}</span>
            <span id="userStatus" class="user-status">User</span>
          </button>
          <div class="account-dropdown" role="menu">
            <a role="menuitem" href="/dashboard/">Dashboard</a>
            <a role="menuitem" href="/history/">Search History</a>
            <a role="menuitem" href="/saved-parts/">Saved Parts</a>
            <a role="menuitem" href="/settings/">Settings</a>
            <button id="navSignOut" role="menuitem" type="button">Sign out</button>
          </div>
        </div>
      </div>
    </header>
  `;
  $("#siteFooter").innerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" aria-label="PartHunt AI home">
            <span class="brand-mark" aria-hidden="true">PH</span>
            <span><strong>PartHunt AI</strong><small>Scrap part finder</small></span>
          </a>
          <p>Search smarter, verify compatibility, and leave the app only when you have the exact seller listing.</p>
          <div class="footer-pills" aria-label="PartHunt trust promises">
            <span>Exact listing checks</span>
            <span>Platform reviews</span>
            <span>Firebase-secured accounts</span>
          </div>
        </div>
        <nav aria-label="Footer search links">
          <h3>Find Parts</h3>
          <a href="/search/part-number/">Search Part Number</a>
          <a href="/search/vehicle/">Search Vehicle</a>
          <a href="/vehicle/ford/focus/2017/">Vehicle Model Selector</a>
          <a href="/search/results/demo-search/">Demo Results</a>
        </nav>
        <nav aria-label="Footer trust links">
          <h3>Trust</h3>
          <a href="/platforms/">Platform Reviews</a>
          <a href="/platforms/ebay/">eBay Review</a>
          <a href="/platforms/breakerlink/">BreakerLink Review</a>
          <a href="/platforms/parts-gateway/">Parts Gateway Review</a>
        </nav>
        <nav aria-label="Footer policy links">
          <h3>Policy</h3>
          <a href="/privacy/">Privacy Policy</a>
          <a href="/terms/">Terms of Use</a>
          <a href="/safety/">Buyer Safety</a>
          <a href="/contact/">Contact Support</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <span>Built for careful used-part buying.</span>
        <span>Before buying, check part number, side, condition, delivery cost, and return policy.</span>
      </div>
    </footer>
  `;
  $("#loginPrompt").innerHTML = `
    <div id="loginModal" class="modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
      <div class="purchase-modal">
        <p class="eyebrow">Account required</p>
        <h2 id="loginModalTitle">Sign in to continue</h2>
        <p>Create a free account to open exact seller links, save parts, and track your search history.</p>
        <div class="login-modal-actions">
          <a id="modalSignIn" class="button button-primary" href="/sign-in/">Sign In</a>
          <a id="modalSignUp" class="button button-secondary" href="/sign-up/">Create Account</a>
          <button id="modalContinue" class="button button-ghost" type="button">Continue Browsing</button>
        </div>
      </div>
    </div>
  `;
  const chat = $("#chatbox");
  if (chat) {
    chat.innerHTML = `
      <header><div><strong>PartHunt Agent</strong><span>AI assistant mode</span></div><button id="chatClose" class="icon-button" type="button" aria-label="Close chat">×</button></header>
      <div id="chatMessages" class="chat-messages" aria-live="polite"><div class="message"><strong>PartHunt Agent</strong>Tell me the make, model, year, and the part location. I can suggest alternative names and compatibility checks.</div></div>
      <form id="chatForm" class="chat-form"><label class="sr-only" for="chatInput">Message</label><input id="chatInput" placeholder="Describe the part you need..." autocomplete="off" /><button class="button button-primary" type="submit">Send</button></form>
    `;
  }
}

function wireShell() {
  $$(".theme-toggle").forEach((button) => button.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark")));
  $("#navSignOut")?.addEventListener("click", () => signOut(auth));
  $("#accountMenuButton")?.addEventListener("click", () => {
    const menu = $("#accountMenu");
    const open = menu.classList.toggle("open");
    $("#accountMenuButton").setAttribute("aria-expanded", String(open));
  });
  $("#modalContinue")?.addEventListener("click", () => $("#loginModal").classList.add("hidden"));
  $("#chatToggle")?.addEventListener("click", () => {
    $("#chatbox").classList.remove("hidden");
    $("#chatToggle").classList.add("hidden");
  });
  $("#chatClose")?.addEventListener("click", () => {
    $("#chatbox").classList.add("hidden");
    $("#chatToggle").classList.remove("hidden");
  });
  $("#chatForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#chatInput");
    const text = input.value.trim();
    if (!text) return;
    $("#chatMessages").insertAdjacentHTML("beforeend", `<div class="message user"><strong>You</strong>${text}</div>`);
    const reply = text.toLowerCase().includes("under") ? "That may be an undertray, splash shield, or lower engine cover. Check fixings and engine/body type." : "Good starting point. Confirm part number, vehicle side, condition, delivery cost, and return policy.";
    $("#chatMessages").insertAdjacentHTML("beforeend", `<div class="message"><strong>PartHunt Agent</strong>${reply}</div>`);
    input.value = "";
  });
}

function requireAuth(action, returnTo = location.pathname) {
  if (currentUser) return true;
  sessionStorage.setItem("parthunt-return-to", returnTo);
  if (action) sessionStorage.setItem("parthunt-pending-action", JSON.stringify(action));
  $("#loginModal")?.classList.remove("hidden");
  return false;
}

function isValidListingUrl(url, platformName = "") {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const path = parsed.pathname.replace(/\/+$/, "");
    if (!path || path === "/") return false;

    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const normalPlatform = String(platformName || "").toLowerCase();
    const homepageHosts = {
      ebay: ["ebay.co.uk", "ebay.com"],
      breakerlink: ["breakerlink.com"],
      "1st choice spares": ["1stchoice.co.uk"],
      "parts gateway": ["partsgateway.co.uk"],
    };
    const matchingHosts = Object.entries(homepageHosts).find(([name]) => normalPlatform.includes(name))?.[1] || [];
    if (matchingHosts.includes(host) && !path.slice(1).includes("/")) return false;
    if (normalPlatform.includes("ebay") && !path.startsWith("/itm/")) return false;
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function firestoreDate(value) {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function searchTypeLabel(value = "") {
  const labels = {
    part_number: "Part number",
    vehicle_part: "Vehicle details",
    chat_assisted: "Chat assisted",
    vehicle: "Vehicle details",
  };
  return labels[value] || "Search";
}

function purchaseStatusLabel(value = "") {
  const labels = {
    still_looking: "Still looking",
    found_not_bought: "Found but not bought",
    bought: "Bought",
    could_not_find: "Could not find item",
    no_longer_needed: "No longer needed",
  };
  return labels[value] || "Still looking";
}

function vehicleSummary(vehicle = {}) {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.variant || vehicle.trim].map((item) => String(item || "").trim()).filter(Boolean).join(" ") || "No vehicle saved";
}

function partSummary(item = {}) {
  return item.selectedPart?.name || item.vehicle?.wantedItem || item.partNumber || item.rawQuery || "Car part search";
}

function serialisableResults(results = []) {
  return results.slice(0, 30).map((result) => ({
    id: result.id || `result-${hashString(result.listingUrl || result.title)}`,
    title: result.title || "",
    description: result.description || "",
    imageUrl: result.imageUrl || "",
    price: result.price || "",
    source: result.source || result.platformName || "",
    platformId: result.platformId || "",
    platformName: result.platformName || result.source || "Listing",
    platformLogoUrl: result.platformLogoUrl || "",
    platformCategory: result.platformCategory || "External listing",
    listingUrl: result.listingUrl || "",
    originalDomain: result.originalDomain || "",
    condition: result.condition || "",
    location: result.location || "",
    delivery: Boolean(result.delivery),
    deliveryOption: result.deliveryOption || "",
    confidenceLabel: result.confidenceLabel || "Check carefully",
  }));
}

function uniquePlatformsFromResults(results = []) {
  const platforms = new Map();
  results.forEach((result) => {
    const name = result.platformName || result.source || "Listing";
    const slug = result.platformId || slugify(name);
    if (!platforms.has(slug)) {
      platforms.set(slug, {
        id: slug,
        slug,
        name,
        category: result.platformCategory || "External listing",
        logoUrl: result.platformLogoUrl || "",
        listingUrl: result.listingUrl || "",
      });
    }
  });
  return Array.from(platforms.values());
}

function withoutUndefined(value) {
  if (Array.isArray(value)) return value.map(withoutUndefined);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, withoutUndefined(entryValue)]));
  }
  return value;
}

function platformLogo(platform = {}, small = false) {
  const name = platform.name || platform.platformName || "Platform";
  const logoUrl = platform.logoUrl || platform.platformLogoUrl || "";
  if (logoUrl) {
    return `<span class="platform-logo-shell ${small ? "small" : ""}"><img class="platform-logo-image" src="${logoUrl}" alt="${name} logo" loading="lazy" onerror="this.parentElement.innerHTML='${initials(name)}'; this.parentElement.classList.add('fallback');" /></span>`;
  }
  return `<span class="platform-logo-shell fallback ${small ? "small" : ""}" aria-hidden="true">${initials(name)}</span>`;
}

function listingImage(result) {
  if (result.imageUrl) {
    return `<img src="${escapeHtml(result.imageUrl)}" alt="${escapeHtml(result.title)}" loading="lazy" onerror="this.closest('.result-image').classList.add('image-missing'); this.remove();" />`;
  }
  return `<div class="no-image-fallback"><span>No image available</span></div>`;
}

function categoryIcon(categoryKey) {
  const icons = {
    online_marketplace: "M18 20h28l5 10h15l9 18H9l9-28Zm5 9-5 10h40l-5-10H23Zm9 25h8v8h-8v-8Zm24 0h8v8h-8v-8Z",
    breaker_yard: "M15 50c5-12 14-19 27-19h12c11 0 20 7 27 19v12h-9a10 10 0 0 1-20 0H44a10 10 0 0 1-20 0h-9V50Zm26-9h17c5 0 9 3 13 9H29c3-6 7-9 12-9Z",
    car_parts_retailer: "M21 25h54v42H21V25Zm9 10v22h36V35H30Zm8 29h20v8H38v-8Z",
    specialist_parts_supplier: "M48 14l30 17v34L48 82 18 65V31l30-17Zm0 13L30 37v21l18 10 18-10V37L48 27Zm-8 15h16v16H40V42Z",
    scrap_yard: "M18 68h60v10H18V68Zm8-8 12-28h20l12 28H26Zm20-39h8v13h-8V21Zm-12 7 6-6 9 9-6 6-9-9Z",
    salvage_yard: "M20 60h56v10H20V60Zm8-9h40l-8-20H36l-8 20Zm15-28h10v11H43V23Z",
    independent_seller: "M48 18a15 15 0 1 1 0 30 15 15 0 0 1 0-30Zm-27 58c3-16 14-25 27-25s24 9 27 25H21Z",
    auction_platform: "M25 31l20-14 8 11-20 14-8-11Zm18 27 20-14 8 11-20 14-8-11ZM30 45l7-5 22 31-7 5-22-31Zm35 28h16v8H46v-8h19Z",
    local_garage: "M18 75V36l30-18 30 18v39H18Zm13-10h34V42L48 32 31 42v23Zm9-15h16v15H40V50Z",
  };
  const path = icons[categoryKey] || "M20 22h56v52H20V22Zm10 10v32h36V32H30Z";
  return `<svg class="category-icon" viewBox="0 0 96 96" aria-hidden="true"><path d="${path}"/></svg>`;
}

function renderPlatformCards(containerSelector = "#platformGrid", list = demoPlatforms) {
  const container = $(containerSelector);
  if (!container) return;
  container.innerHTML = list.map((platform) => `
    <article class="platform-card">
      <div class="platform-image">${platformLogo(platform)}</div>
      <div>
        <h3>${platform.name}</h3>
        <span class="category-badge">${categoryIcon(platform.categoryKey)}${platform.category}</span>
      </div>
      ${starRating(platform.averageRating)}
      <div class="result-meta"><span class="tag">${platform.reviewCount} reviews</span><span class="tag">${platform.successfulPurchaseCount} purchases</span></div>
      <p class="muted">Popular for: ${platform.topPartCategories.join(", ")}</p>
      <p>${platform.summary}</p>
      <a class="button button-secondary" href="/platforms/${platform.slug}/">View Platform Review</a>
    </article>
  `).join("");
}

function initPlatformCarousel() {
  const track = $("#platformCarouselTrack");
  if (!track) return;
  track.innerHTML = demoPlatforms
    .sort((a, b) => b.successfulPurchaseCount - a.successfulPurchaseCount || b.averageRating - a.averageRating)
    .slice(0, 10)
    .map((platform) => `
      <article class="platform-card carousel-card">
        <div class="platform-image">${platformLogo(platform)}</div>
        <div>
          <h3>${platform.name}</h3>
          <span class="category-badge">${categoryIcon(platform.categoryKey)}${platform.category}</span>
        </div>
        ${starRating(platform.averageRating)}
        <div class="result-meta"><span class="tag">${platform.reviewCount} reviews</span><span class="tag">${platform.successfulPurchaseCount} purchases</span></div>
        <p class="muted">Popular for: ${platform.topPartCategories.join(", ")}</p>
        <a class="button button-secondary" href="/platforms/${platform.slug}/">View Platform Review</a>
      </article>
    `).join("");

  $$(".carousel-control").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.direction === "next" ? 1 : -1;
      track.scrollBy({ left: direction * Math.min(760, track.clientWidth * 0.82), behavior: "smooth" });
    });
  });
}

function initPlatformDirectory() {
  const category = $("#platformCategoryFilter");
  const sort = $("#platformSort");
  if (!category || !sort) return;

  const apply = () => {
    let platforms = [...demoPlatforms];
    if (category.value) {
      platforms = platforms.filter((platform) => platform.categoryKey === category.value);
    }
    if (sort.value === "rating") {
      platforms.sort((a, b) => b.averageRating - a.averageRating || b.successfulPurchaseCount - a.successfulPurchaseCount);
    } else if (sort.value === "reviews") {
      platforms.sort((a, b) => b.reviewCount - a.reviewCount || b.averageRating - a.averageRating);
    } else if (sort.value === "newest") {
      platforms.reverse();
    } else {
      platforms.sort((a, b) => b.successfulPurchaseCount - a.successfulPurchaseCount || b.averageRating - a.averageRating);
    }
    renderPlatformCards("#platformGrid", platforms);
  };

  category.addEventListener("change", apply);
  sort.addEventListener("change", apply);
  apply();
}

async function saveSearch(search) {
  if (!currentUser) return null;
  const results = serialisableResults(search.results || []);
  const cleanSearch = withoutUndefined({
    ...search,
    results,
    savedResultIds: results.map((result) => result.id),
    userId: currentUser.uid,
  });
  const ref = await addDoc(collection(db, "users", currentUser.uid, "searchHistory"), {
    ...cleanSearch,
    purchaseStatus: "still_looking",
    searchedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hashString(value) {
  return [...String(value || "")].reduce((hash, character) => ((hash << 5) - hash + character.charCodeAt(0)) | 0, 0);
}

function priceRangeForPart(partName) {
  const value = String(partName || "").toLowerCase();
  if (value.includes("engine")) return [650, 2800];
  if (value.includes("gearbox") || value.includes("transmission")) return [380, 1600];
  if (value.includes("turbo")) return [180, 720];
  if (value.includes("ecu")) return [90, 430];
  if (value.includes("alternator") || value.includes("starter")) return [45, 240];
  if (value.includes("bumper") || value.includes("bonnet") || value.includes("door")) return [55, 360];
  if (value.includes("mirror") || value.includes("light") || value.includes("headlamp")) return [35, 260];
  if (value.includes("wheel") || value.includes("tyre")) return [40, 520];
  if (value.includes("battery")) return [35, 190];
  return [25, 320];
}

function createSearchResults(search, pageNumber = 1, limit = 10) {
  const vehicle = search.vehicle || {};
  const partName = search.selectedPart?.name || vehicle.wantedItem || search.partNumber || "car part";
  const vehicleName = [vehicle.year, vehicle.make, vehicle.model, vehicle.variant].filter(Boolean).join(" ");
  const queryTitle = [vehicleName, partName].filter(Boolean).join(" ");
  const seed = Math.abs(hashString(`${search.rawQuery}-${partName}-${vehicleName}`));
  const [minPrice, maxPrice] = priceRangeForPart(partName);
  const conditions = ["Used", "Used", "Used", "Refurbished", "Used", "New", "Scrap/breaker part", "Used", "Refurbished", "Used", "Used", "Refurbished"];
  const locations = ["Manchester", "Birmingham", "Leeds", "Bristol", "Glasgow", "London", "Cardiff", "Nottingham", "Liverpool", "Sheffield", "Newcastle", "Coventry"];
  const confidence = ["High match", "High match", "Possible match", "Possible match", "Check carefully", "Possible match", "High match", "Possible match", "Check carefully", "Possible match"];
  const platformSequence = Array.from({ length: 28 }, (_, index) => {
    const base = ["ebay", "breakerlink", "parts-gateway", "1st-choice-spares", "local-scrap-yard", "independent-breaker-yard", "ebay", "parts-gateway", "breakerlink", "ebay"];
    return demoPlatforms.find((platform) => platform.id === base[index % base.length]);
  }).filter(Boolean);
  const titleTemplates = [
    `${queryTitle} used replacement part`,
    `${queryTitle} breaker yard quote`,
    `${queryTitle} tested recycled part`,
    `${queryTitle} supplier matched listing`,
    `${queryTitle} collection-only salvage part`,
    `${queryTitle} inspected used part`,
    `${queryTitle} exact-fit possible match`,
    `${queryTitle} replacement assembly`,
    `${queryTitle} dismantled vehicle part`,
    `${queryTitle} online marketplace listing`,
  ];
  const images = ["/assets/results/front-bumper-ebay.svg", "/assets/results/front-bumper-breaker.svg", "/assets/results/front-bumper-recycled.svg"];

  return platformSequence.map((platform, index) => {
    const variation = (seed + index * 47) % Math.max(1, maxPrice - minPrice);
    const price = minPrice + variation;
    const listingSlug = slugify(`${queryTitle}-${platform.slug}-${index + 1}`) || `listing-${index + 1}`;
    const listingUrl = platform.id === "ebay"
      ? `https://www.ebay.co.uk/itm/${100000000 + ((seed + index * 931) % 899999999)}`
      : platform.websiteUrl
        ? `${platform.websiteUrl.replace(/\/$/, "")}/parts/${listingSlug}`
        : "";

    return {
      id: `res-${platform.id}-${listingSlug}`,
      title: titleTemplates[index % titleTemplates.length],
      description: `Generated from your search for ${queryTitle}. Confirm part number, vehicle side, variant, condition, delivery cost, and return policy before buying.`,
      imageUrl: images[index % images.length],
      price: `£${price}`,
      source: platform.name,
      platformId: platform.id,
      platformName: platform.name,
      platformLogoUrl: platform.logoUrl,
      platformCategory: platform.category,
      listingUrl,
      originalDomain: platform.websiteUrl ? new URL(platform.websiteUrl).hostname.replace(/^www\./, "") : "local seller",
      condition: conditions[index % conditions.length],
      location: locations[(seed + index) % locations.length],
      delivery: index % 4 !== 0,
      deliveryOption: index % 4 !== 0 ? "Delivery available" : "Collection only",
      confidenceLabel: confidence[index % confidence.length],
    };
  });
}

async function searchPartsApi(input = {}) {
  const pageNumber = Math.max(1, Number(input.page) || 1);
  const limit = Math.max(1, Math.min(30, Number(input.limit) || 10));
  try {
    const response = await fetch("/api/search-parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, page: pageNumber, limit }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "Search request failed.");
    if (Array.isArray(body.results) || Array.isArray(body.allResults)) return body;
  } catch (error) {
    console.warn("Using demo search fallback. Configure SERPAPI_KEY and deploy /api/search-parts for live results.", error);
  }

  const allResults = createSearchResults(input);
  const totalResults = allResults.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / limit));
  const start = (pageNumber - 1) * limit;
  return {
    results: allResults.slice(start, start + limit),
    allResults,
    totalResults,
    currentPage: pageNumber,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    provider: "demo",
  };
}

function showSearchOverlay(message = "Searching live part listings") {
  let overlay = $("#searchLoadingOverlay");
  if (!overlay) {
    document.body.insertAdjacentHTML("beforeend", `<section id="searchLoadingOverlay" class="search-loading-overlay hidden" role="status" aria-live="polite"></section>`);
    overlay = $("#searchLoadingOverlay");
  }
  overlay.innerHTML = `
    <div class="search-loading-card">
      <div class="search-orbit" aria-hidden="true"><span></span><span></span></div>
      <p class="eyebrow">PartHunt AI</p>
      <h2>${escapeHtml(message)}</h2>
      <p>Checking eBay, specialist platforms, breakers, and wider web results.</p>
    </div>
  `;
  overlay.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function hideSearchOverlay() {
  $("#searchLoadingOverlay")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

async function runSearch(search) {
  if (!requireAuth({ type: "runSearch", search }, location.pathname)) return;
  showSearchOverlay();
  try {
    const response = await searchPartsApi({ ...search, page: 1, limit: 30 });
    const payload = { id: `srch_${Date.now()}`, ...search, results: response.allResults || response.results || [], totalResults: response.totalResults, provider: response.provider || "demo" };
    sessionStorage.setItem("parthunt-current-search", JSON.stringify(payload));
    location.href = "/search/results/demo-search/";
  } catch (error) {
    console.error(error);
    hideSearchOverlay();
    alert(error.message || "Search failed. Please try again.");
  }
}

function initAuthPages() {
  $("#googleSignIn")?.addEventListener("click", async () => {
    await signInWithPopup(auth, provider);
    location.href = "/";
  });
  $("#signInForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await signInWithEmailAndPassword(auth, $("#email").value.trim(), $("#password").value);
    location.href = "/";
  });
  $("#signUpForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if ($("#password").value !== $("#confirmPassword").value) {
      alert("Passwords do not match.");
      return;
    }
    const credential = await createUserWithEmailAndPassword(auth, $("#email").value.trim(), $("#password").value);
    await updateProfile(credential.user, { displayName: $("#fullName").value.trim() });
    await setDoc(doc(db, "users", credential.user.uid), {
      name: $("#fullName").value.trim(),
      email: $("#email").value.trim(),
      country: $("#country")?.value || "",
      preferredMake: $("#preferredMake")?.value || "",
      userType: $("#userType")?.value || "car_owner",
      createdAt: serverTimestamp(),
    }, { merge: true });
    location.href = "/";
  });
  $("#forgotForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await sendPasswordResetEmail(auth, $("#email").value.trim());
    $("#resetStatus").textContent = "Password reset email sent.";
  });
}

function initPartSearch() {
  $("#partSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector("[type='submit']");
    const status = $("#partSearchStatus");
    const vehicle = { make: $("#make").value.trim(), model: $("#model").value.trim(), year: $("#year").value.trim(), engineSize: $("#engineSize").value.trim(), fuelType: $("#fuelType").value, transmission: $("#transmission").value };
    const partNumber = $("#partNumber").value.trim();
    if (!partNumber) {
      status.textContent = "Enter a part number before searching.";
      $("#partNumber").focus();
      return;
    }
    status.textContent = "";
    submit.disabled = true;
    submit.dataset.originalText = submit.textContent;
    submit.textContent = "Preparing search...";
    runSearch({
      searchType: "part_number",
      partNumber,
      vehicle,
      rawQuery: [partNumber, vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" "),
      generatedSearchTerms: [`"${partNumber}"`, `${vehicle.year} ${vehicle.make} ${vehicle.model} ${partNumber}`.trim(), `${vehicle.make} ${vehicle.model} ${partNumber}`.trim()].filter(Boolean),
    }).finally(() => {
      submit.disabled = false;
      submit.textContent = submit.dataset.originalText || "Search Part";
    });
  });
}

function findOptionByTextOrValue(select, value) {
  if (!select || !value) return "";
  const normalised = String(value).toLowerCase();
  return [...select.options].find((option) => option.value.toLowerCase() === normalised || option.text.toLowerCase() === normalised)?.value || "";
}

function vehicleYearRange(profile = {}) {
  const currentYear = new Date().getFullYear();
  return {
    from: Math.max(2012, Number(profile.from) || 2012),
    to: Math.min(currentYear, Number(profile.to) || currentYear),
  };
}

function getVariantProfiles(makeValue, modelValue) {
  if (!makeValue || !modelValue) return [];
  return popularVehicleVariants[makeValue]?.[modelValue] || [
    { name: "Standard", from: 2012 },
    { name: "SE", from: 2012 },
    { name: "Sport", from: 2012 },
    { name: "Premium", from: 2012 },
    { name: "Other / not sure", from: 2012 },
  ];
}

function populateVehicleYears(profile = null, selectedYear = "") {
  const yearSelect = $("#year");
  if (!yearSelect) return;
  if (!profile) {
    yearSelect.innerHTML = `<option value="">Select variant first</option>`;
    yearSelect.disabled = true;
    return;
  }

  const { from, to } = vehicleYearRange(profile);
  const years = [];
  for (let year = to; year >= from; year -= 1) {
    years.push(`<option value="${year}">${year}</option>`);
  }
  yearSelect.innerHTML = `<option value="">Select year</option>${years.join("")}`;
  yearSelect.disabled = false;
  if (selectedYear) {
    const matchingValue = findOptionByTextOrValue(yearSelect, selectedYear);
    if (matchingValue) yearSelect.value = matchingValue;
  }
}

function populateVehicleVariants(makeValue, modelValue, selectedVariant = "", selectedYear = "") {
  const variantSelect = $("#variant");
  if (!variantSelect) return;
  const profiles = getVariantProfiles(makeValue, modelValue);
  variantSelect.innerHTML = profiles.length
    ? `<option value="">Select variant</option>${profiles.map((profile) => `<option value="${profile.name}">${profile.name}</option>`).join("")}`
    : `<option value="">Select model first</option>`;
  variantSelect.disabled = !profiles.length;
  populateVehicleYears(null);

  const matchingVariant = selectedVariant ? findOptionByTextOrValue(variantSelect, selectedVariant) : "";
  if (matchingVariant) {
    variantSelect.value = matchingVariant;
    populateVehicleYears(profiles.find((profile) => profile.name === matchingVariant), selectedYear);
  }
}

function populateVehicleModels(makeValue, selectedModel = "") {
  const modelSelect = $("#model");
  if (!modelSelect) return;
  const models = popularVehicleMakes[makeValue] || [];
  modelSelect.innerHTML = models.length
    ? `<option value="">Select model</option>${models.map((model) => `<option value="${model}">${model}</option>`).join("")}`
    : `<option value="">Select make first</option>`;
  modelSelect.disabled = !models.length;
  populateVehicleVariants("", "");
  if (selectedModel) {
    const matchingValue = findOptionByTextOrValue(modelSelect, selectedModel);
    if (matchingValue) {
      modelSelect.value = matchingValue;
      populateVehicleVariants(makeValue, matchingValue);
    }
  }
}

function initVehicleDropdowns() {
  const makeSelect = $("#make");
  const modelSelect = $("#model");
  const variantSelect = $("#variant");
  const yearSelect = $("#year");
  if (!makeSelect || !yearSelect || makeSelect.tagName !== "SELECT" || yearSelect.tagName !== "SELECT") return;

  const makes = Object.keys(popularVehicleMakes).sort((a, b) => a.localeCompare(b));
  makeSelect.innerHTML = `<option value="">Select make</option>${makes.map((make) => `<option value="${make}">${make}</option>`).join("")}`;
  populateVehicleYears(null);

  makeSelect.addEventListener("change", () => populateVehicleModels(makeSelect.value));
  modelSelect?.addEventListener("change", () => populateVehicleVariants(makeSelect.value, modelSelect.value));
  variantSelect?.addEventListener("change", () => {
    const profile = getVariantProfiles(makeSelect.value, modelSelect.value).find((item) => item.name === variantSelect.value);
    populateVehicleYears(profile || null);
  });
}

function initVehicleSearch() {
  initVehicleDropdowns();
  $("#lookupRegistrationButton")?.addEventListener("click", lookupRegistration);
  $("#vehicleSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const vehicle = { make: $("#make").value, model: $("#model").value, variant: $("#variant").value, year: $("#year").value, wantedItem: $("#wantedItem").value.trim() };
    sessionStorage.setItem("parthunt-vehicle", JSON.stringify(vehicle));
    const searchBase = [vehicle.year, vehicle.make, vehicle.model, vehicle.variant, vehicle.wantedItem].filter(Boolean).join(" ");
    runSearch({
      searchType: "vehicle_part",
      vehicle,
      selectedPart: {
        id: vehicle.wantedItem.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "searched-part",
        name: vehicle.wantedItem,
        category: "User search",
        alternativeNames: [],
      },
      rawQuery: searchBase.trim(),
      generatedSearchTerms: [searchBase.trim(), `${vehicle.make} ${vehicle.model} ${vehicle.wantedItem}`.trim(), `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.wantedItem}`.trim()],
    });
  });
}

function normaliseRegistration(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function fillVehicleFromLookup(vehicle) {
  const makeSelect = $("#make");
  const yearSelect = $("#year");
  const makeValue = findOptionByTextOrValue(makeSelect, vehicle.make);
  if (makeValue) {
    makeSelect.value = makeValue;
    populateVehicleModels(makeValue, vehicle.model);
  }
  if (vehicle.yearOfManufacture) {
    const yearValue = findOptionByTextOrValue(yearSelect, vehicle.yearOfManufacture);
    if (yearValue) yearSelect.value = yearValue;
  }
  sessionStorage.setItem("parthunt-registration-vehicle", JSON.stringify(vehicle));
}

async function lookupRegistration() {
  const status = $("#registrationLookupStatus");
  const registrationNumber = normaliseRegistration($("#registrationNumber").value);
  if (!registrationNumber) {
    status.textContent = "Enter a UK registration number first.";
    return;
  }
  const isLocalStatic = ["127.0.0.1", "localhost"].includes(location.hostname);
  if (isLocalStatic && registrationNumber === "AA19AAA") {
    const demoVehicle = { registrationNumber, make: "FORD", model: "Focus", yearOfManufacture: 2019, fuelType: "Petrol", engineCapacity: 2000, colour: "Red", source: "demo" };
    fillVehicleFromLookup(demoVehicle);
    status.textContent = "Demo vehicle loaded. Live DVLA lookup is available on the deployed app.";
    return;
  }
  status.textContent = "Looking up vehicle details...";
  try {
    const response = await fetch("/api/vehicle-lookup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationNumber }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Vehicle lookup failed.");
    fillVehicleFromLookup(data.vehicle);
    status.textContent = `Found ${data.vehicle.yearOfManufacture || ""} ${data.vehicle.make || "vehicle"}${data.vehicle.model ? ` ${data.vehicle.model}` : ""}. Add the model if DVLA did not provide it, then view the car.`;
  } catch (error) {
    console.warn(error);
    if (registrationNumber === "AA19AAA") {
      const demoVehicle = { registrationNumber, make: "FORD", model: "Focus", yearOfManufacture: 2019, fuelType: "Petrol", engineCapacity: 2000, colour: "Red", source: "demo" };
      fillVehicleFromLookup(demoVehicle);
      status.textContent = "Demo vehicle loaded. Live DVLA lookup is available on the deployed app.";
      return;
    }
    status.textContent = error.message || "Vehicle lookup failed. Check the registration and try again.";
  }
}

function initVehicleModel() {
  const vehicle = JSON.parse(sessionStorage.getItem("parthunt-vehicle") || '{"make":"Ford","model":"Focus","year":"2017","bodyType":"Hatchback"}');
  $("#vehicleTitle") && ($("#vehicleTitle").textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.bodyType || ""}`.trim());
  const list = $("#partList");
  const selected = $("#selectedPartPanel");
  if (!list || !selected) return;
  list.innerHTML = parts.map((part) => `<button class="button button-ghost" type="button" data-part="${part.id}">${part.name}</button>`).join("");
  function select(partId) {
    const part = parts.find((item) => item.id === partId) || parts[0];
    selected.innerHTML = `<p class="eyebrow">Selected part</p><h3>${part.name}</h3><p>Alternative names: ${part.alternativeNames.join(", ")}</p><ul class="check-list">${part.compatibilityNotes.map((note) => `<li>${note}</li>`).join("")}</ul><button id="searchThisPart" class="button button-primary full-width" type="button">Search This Part</button>`;
    $("#searchThisPart").addEventListener("click", () => runSearch({
      searchType: "vehicle_part",
      vehicle,
      selectedPart: part,
      rawQuery: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${part.name} used`,
      generatedSearchTerms: [`${vehicle.year} ${vehicle.make} ${vehicle.model} ${part.name} used`, `${vehicle.make} ${vehicle.model} ${part.name} breaker`, ...part.alternativeNames.map((name) => `${vehicle.year} ${vehicle.make} ${vehicle.model} ${name}`)],
    }));
  }
  list.querySelectorAll("[data-part]").forEach((button) => button.addEventListener("click", () => select(button.dataset.part)));
  select("front-bumper");
}

function comparedResultIds() {
  return JSON.parse(sessionStorage.getItem("parthunt-compare-results") || "[]");
}

function saveComparedResultIds(ids) {
  sessionStorage.setItem("parthunt-compare-results", JSON.stringify(ids.slice(0, 4)));
}

function renderCompareTray(search = {}) {
  let tray = $("#compareTray");
  const selectedIds = comparedResultIds();
  const selectedResults = (search.results || []).filter((result) => selectedIds.includes(result.id));
  if (!tray) {
    document.body.insertAdjacentHTML("beforeend", `<aside id="compareTray" class="compare-tray hidden" aria-live="polite"></aside>`);
    tray = $("#compareTray");
  }
  tray.classList.toggle("hidden", !selectedResults.length);
  tray.innerHTML = selectedResults.length ? `
    <button class="compare-tray-main" type="button" data-open-compare aria-label="Open comparison">
      <div>
      <p class="eyebrow">Compare</p>
      <strong>${selectedResults.length} selected</strong>
      </div>
      <div class="compare-items">
        ${selectedResults.map((result) => `<span>${escapeHtml(result.title.slice(0, 44))}${result.title.length > 44 ? "..." : ""}</span>`).join("")}
      </div>
    </button>
    <button class="button button-ghost" type="button" data-clear-compare>Clear</button>
  ` : "";
  tray.querySelector("[data-open-compare]")?.addEventListener("click", () => openCompareOverlay(search));
  tray.querySelector("[data-clear-compare]")?.addEventListener("click", () => {
    saveComparedResultIds([]);
    renderCompareTray(search);
    $$(".result-card.is-compared").forEach((card) => card.classList.remove("is-compared"));
    $$("[data-compare]").forEach((button) => (button.textContent = "Compare"));
  });
}

function openCompareOverlay(search = {}) {
  const selectedIds = comparedResultIds();
  const selectedResults = (search.results || []).filter((result) => selectedIds.includes(result.id));
  if (!selectedResults.length) return;

  let overlay = $("#compareOverlay");
  if (!overlay) {
    document.body.insertAdjacentHTML("beforeend", `<section id="compareOverlay" class="compare-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="compareOverlayTitle"></section>`);
    overlay = $("#compareOverlay");
  }

  overlay.innerHTML = `
    <div class="compare-modal">
      <div class="compare-modal-header">
        <div>
          <p class="eyebrow">Part comparison</p>
          <h2 id="compareOverlayTitle">Compare selected listings</h2>
        </div>
        <button class="icon-button" type="button" data-close-compare aria-label="Close comparison">×</button>
      </div>
      <div class="compare-table" style="--compare-count: ${selectedResults.length}">
        ${selectedResults.map((result) => {
          const valid = isValidListingUrl(result.listingUrl, result.platformName);
          return `<article class="compare-card">
            <div class="compare-card-image">${listingImage(result)}</div>
            <div class="compare-card-body">
              <div class="result-platform">${platformLogo(result, true)}<div><strong>${escapeHtml(result.platformName || "Listing")}</strong><span>${escapeHtml(result.platformCategory || "External listing")}</span></div></div>
              <h3>${escapeHtml(result.title)}</h3>
              <p>${escapeHtml(result.description || "Check the seller listing carefully before buying.")}</p>
              <dl>
                <div><dt>Price</dt><dd>${escapeHtml(result.price || "Check listing")}</dd></div>
                <div><dt>Condition</dt><dd>${escapeHtml(result.condition || "Check listing")}</dd></div>
                <div><dt>Location</dt><dd>${escapeHtml(result.location || "Check listing")}</dd></div>
                <div><dt>Delivery</dt><dd>${escapeHtml(result.deliveryOption || "Check listing")}</dd></div>
                <div><dt>Match</dt><dd>${escapeHtml(result.confidenceLabel || "Check carefully")}</dd></div>
              </dl>
              ${valid ? `<button class="button button-primary full-width" type="button" data-listing="${escapeHtml(result.listingUrl)}">View Exact Listing</button>` : `<button class="button button-ghost full-width" type="button" disabled>Listing unavailable</button>`}
            </div>
          </article>`;
        }).join("")}
      </div>
    </div>
  `;
  overlay.classList.remove("hidden");
  document.body.classList.add("modal-open");
  overlay.querySelector("[data-close-compare]")?.addEventListener("click", closeCompareOverlay);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeCompareOverlay();
  }, { once: true });
  overlay.querySelectorAll("[data-listing]").forEach((button) => button.addEventListener("click", () => {
    const url = button.dataset.listing;
    if (!requireAuth({ type: "openListing", url }, location.pathname)) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }));
}

function closeCompareOverlay() {
  $("#compareOverlay")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function toggleCompare(resultId, search = {}) {
  const ids = comparedResultIds();
  const exists = ids.includes(resultId);
  const nextIds = exists ? ids.filter((id) => id !== resultId) : [...ids, resultId].slice(-4);
  saveComparedResultIds(nextIds);
  $$("[data-compare]").forEach((button) => {
    const selected = nextIds.includes(button.dataset.compare);
    button.textContent = selected ? "Selected" : "Compare";
    button.closest(".result-card")?.classList.toggle("is-compared", selected);
  });
  renderCompareTray(search);
}

function askAgentAboutResult(resultId, search = {}) {
  const result = (search.results || []).find((item) => item.id === resultId);
  if (!result) return;
  $("#chatbox")?.classList.remove("hidden");
  $("#chatToggle")?.classList.add("hidden");
  const messages = $("#chatMessages");
  if (!messages) return;
  messages.insertAdjacentHTML("beforeend", `<div class="message user"><strong>You</strong>Can you help me check this listing: ${result.title}</div>`);
  messages.insertAdjacentHTML("beforeend", `<div class="message"><strong>PartHunt Agent</strong>Check the part number, vehicle year range, side, condition photos, seller returns, and delivery cost before opening the listing. This result is marked "${result.confidenceLabel}", so compare the title against your vehicle details carefully.</div>`);
  messages.scrollTop = messages.scrollHeight;
}

function initResults() {
  const search = JSON.parse(sessionStorage.getItem("parthunt-current-search") || "null") || {
    searchType: "vehicle_part",
    rawQuery: "2017 Ford Focus front bumper",
    vehicle: { year: "2017", make: "Ford", model: "Focus", wantedItem: "front bumper" },
    selectedPart: { name: "front bumper" },
  };
  if (search.provider !== "serpapi" && (!Array.isArray(search.results) || !search.results.length || search.results.some((result) => !result.title || !result.confidenceLabel))) {
    search.results = createSearchResults(search);
    sessionStorage.setItem("parthunt-current-search", JSON.stringify(search));
  }
  $("#resultsTitle") && ($("#resultsTitle").textContent = `Results for: ${search.rawQuery}`);
  const grid = $("#resultsGrid");
  if (!grid) return;
  let currentPage = Number(new URLSearchParams(location.search).get("page")) || 1;
  const perPage = 10;

  const renderResults = (results) => {
    grid.innerHTML = results.length ? results.map((result) => {
    const platform = demoPlatforms.find((item) => item.id === result.platformId) || result;
    const valid = isValidListingUrl(result.listingUrl, result.platformName);
    const confidenceClass = result.confidenceLabel === "High match" ? "high" : result.confidenceLabel === "Possible match" ? "possible" : "careful";
    return `<article class="result-card" data-result-id="${result.id}">
      <div class="result-image">
        ${listingImage(result)}
        <span class="result-image-badge">${escapeHtml(result.condition || "Check listing")}</span>
      </div>
      <div class="result-body">
        <div class="result-card-top">
          <div class="result-platform">${platformLogo(platform, true)}<div><strong>${escapeHtml(result.platformName || "Listing")}</strong><span>${escapeHtml(result.platformCategory || "External listing")}</span></div></div>
          <span class="tag confidence ${confidenceClass}">${escapeHtml(result.confidenceLabel || "Check carefully")}</span>
        </div>
        <h3>${escapeHtml(result.title)}</h3>
        <p class="muted">${escapeHtml(result.description || "Review the original listing carefully before buying.")}</p>
        <div class="result-meta"><span class="tag">${escapeHtml(result.location || "Check listing")}</span><span class="tag">${escapeHtml(result.deliveryOption || (result.delivery ? "Delivery available" : "Collection only"))}</span></div>
        <div class="result-card-bottom">
          <div><span class="price">${escapeHtml(result.price || "Check listing")}</span><small>Confirm on seller page</small></div>
        </div>
        <div class="card-actions">
          ${valid ? `<button class="button button-primary" type="button" data-listing="${escapeHtml(result.listingUrl)}">View Exact Listing</button>` : `<button class="button button-ghost" type="button" disabled>Listing unavailable</button>`}
          <button class="button button-secondary" type="button" data-compare="${result.id}">Compare</button>
          <button class="button button-ghost" type="button" data-agent="${result.id}">Ask Agent</button>
        </div>
      </div>
    </article>`;
    }).join("") : `<div class="empty-state">No results match those filters.</div>`;

    grid.querySelectorAll("[data-listing]").forEach((button) => button.addEventListener("click", () => {
      const url = button.dataset.listing;
      if (!requireAuth({ type: "openListing", url }, location.pathname)) return;
      window.open(url, "_blank", "noopener,noreferrer");
    }));
    grid.querySelectorAll("[data-compare]").forEach((button) => button.addEventListener("click", () => toggleCompare(button.dataset.compare, search)));
    grid.querySelectorAll("[data-agent]").forEach((button) => button.addEventListener("click", () => askAgentAboutResult(button.dataset.agent, search)));
    const selectedIds = comparedResultIds();
    grid.querySelectorAll("[data-compare]").forEach((button) => {
      const selected = selectedIds.includes(button.dataset.compare);
      button.textContent = selected ? "Selected" : "Compare";
      button.closest(".result-card")?.classList.toggle("is-compared", selected);
    });
  };

  const renderPagination = (filtered) => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const controls = $("#paginationControls");
    if (!controls) return;
    controls.innerHTML = `
      <button class="button button-ghost" type="button" data-page-action="prev" ${currentPage === 1 ? "disabled" : ""}>Previous</button>
      <span>Page ${currentPage} of ${totalPages}</span>
      <button class="button button-ghost" type="button" data-page-action="next" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>
    `;
    controls.querySelector("[data-page-action='prev']")?.addEventListener("click", () => {
      currentPage -= 1;
      applyFilters();
    });
    controls.querySelector("[data-page-action='next']")?.addEventListener("click", () => {
      currentPage += 1;
      applyFilters();
    });
  };

  function applyFilters() {
    const condition = $("#conditionFilter")?.value || "";
    const deliveryOnly = Boolean($("#deliveryFilter")?.checked);
    const filtered = search.results.filter((result) => {
      const conditionMatches = !condition || result.condition === condition;
      const deliveryMatches = !deliveryOnly || Boolean(result.delivery);
      return conditionMatches && deliveryMatches;
    });
    renderPagination(filtered);
    const start = (currentPage - 1) * perPage;
    renderResults(filtered.slice(start, start + perPage));
  }

  $("#conditionFilter")?.addEventListener("change", applyFilters);
  $("#deliveryFilter")?.addEventListener("change", applyFilters);
  if (search.savedHistoryId && $("#saveSearchButton")) {
    $("#saveSearchButton").textContent = "Saved";
    $("#saveSearchButton").disabled = true;
    $("#saveSearchStatus") && ($("#saveSearchStatus").textContent = "This search is saved to your history.");
  }
  $("#saveSearchButton")?.addEventListener("click", async () => {
    if (!requireAuth({ type: "saveSearch", search }, location.pathname)) return;
    const button = $("#saveSearchButton");
    const status = $("#saveSearchStatus");
    if (search.savedHistoryId) {
      status.textContent = "This search is already saved to your history.";
      return;
    }
    button.disabled = true;
    button.textContent = "Saving...";
    status.textContent = "";
    try {
      const savedId = await saveSearch({
        searchType: search.searchType,
        rawQuery: search.rawQuery,
        generatedSearchTerms: search.generatedSearchTerms || [search.rawQuery],
        vehicle: search.vehicle || null,
        selectedPart: search.selectedPart || null,
        partNumber: search.partNumber || null,
        resultsCount: search.results.length,
        provider: search.provider || "",
        results: search.results,
      });
      search.savedHistoryId = savedId;
      sessionStorage.setItem("parthunt-current-search", JSON.stringify(search));
      status.textContent = "Search saved to your history.";
      button.textContent = "Saved";
    } catch (error) {
      console.error(error);
      status.textContent = `Could not save this search: ${error.message || "Check your connection and Firestore rules."}`;
      button.disabled = false;
      button.textContent = "Save Search";
    }
  });
  applyFilters();
  renderCompareTray(search);
}

function reviewStats(reviews = [], seedPlatform = {}) {
  if (!reviews.length) {
    return {
      averageRating: 0,
      averageItemRating: 0,
      averageDeliveryRating: 0,
      wouldBuyAgainPercentage: 0,
      topPartCategories: seedPlatform.topPartCategories || [],
      breakdown: [0, 0, 0, 0, 0],
    };
  }
  const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const ratings = reviews.map((review) => Number(review.overallRating || review.itemRating || 0)).filter(Boolean);
  const itemRatings = reviews.map((review) => Number(review.itemRating || 0)).filter(Boolean);
  const deliveryRatings = reviews.map((review) => Number(review.deliveryRating || 0)).filter(Boolean);
  const buyAgainCount = reviews.filter((review) => review.wouldBuyAgain).length;
  const partCounts = reviews.reduce((counts, review) => {
    const part = review.partName || "Car parts";
    counts[part] = (counts[part] || 0) + 1;
    return counts;
  }, {});
  const breakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = ratings.filter((value) => Math.round(value) === rating).length;
    return Math.round((count / reviews.length) * 100);
  });
  return {
    averageRating: average(ratings),
    averageItemRating: average(itemRatings),
    averageDeliveryRating: average(deliveryRatings),
    wouldBuyAgainPercentage: Math.round((buyAgainCount / reviews.length) * 100),
    topPartCategories: Object.entries(partCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name]) => name),
    breakdown,
  };
}

async function loadPlatformReviews(slug, platformName) {
  const snapshot = await getDocs(query(collection(db, "platformReviews"), orderBy("createdAt", "desc")));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((review) => {
      const reviewSlug = review.platformSlug || slugify(review.platformName || "");
      return reviewSlug === slug || (platformName && (review.platformName || "").toLowerCase() === platformName.toLowerCase());
    });
}

async function initPlatformProfile() {
  const slug = location.pathname.split("/").filter(Boolean).pop();
  const platform = demoPlatforms.find((item) => item.slug === slug) || demoPlatforms[0];
  const target = $("#platformProfileContent");
  if (!target) return;
  target.innerHTML = `<div class="empty-state">Loading platform reviews...</div>`;
  let reviews = [];
  try {
    reviews = await loadPlatformReviews(slug, platform.name);
  } catch (error) {
    console.error(error);
  }
  const stats = reviewStats(reviews, platform);
  const reviewCount = reviews.length;
  const commonParts = stats.topPartCategories.length ? stats.topPartCategories.join(", ") : "Reviews will reveal this once users start buying.";
  target.innerHTML = `<article class="platform-profile-card">
    <div class="platform-profile-cover">${platform.coverImageUrl ? `<img src="${platform.coverImageUrl}" alt="" />` : `<div>${platformLogo(platform)}<span>${platform.category}</span></div>`}</div>
    <div class="platform-profile-header"><div>${platformLogo(platform)}<p class="eyebrow">Platform profile</p><h1>${escapeHtml(platform.name)}</h1><span class="category-badge">${categoryIcon(platform.categoryKey)}${escapeHtml(platform.category)}</span></div><div>${reviewCount ? starRating(stats.averageRating) : "<p class='muted'>Ratings will appear once users start reviewing this platform.</p>"}<strong>${reviewCount} user reviews</strong><p class="muted">${reviewCount} successful purchases recorded</p></div></div>
    <div class="result-meta"><span class="tag">Item ${stats.averageItemRating ? stats.averageItemRating.toFixed(1) : "0.0"}/5</span><span class="tag">Delivery ${stats.averageDeliveryRating ? stats.averageDeliveryRating.toFixed(1) : "0.0"}/5</span><span class="tag">${stats.wouldBuyAgainPercentage}% would buy again</span></div>
    <p>${escapeHtml(reviewCount ? "This trust profile is calculated from PartHunt user reviews connected to saved search history." : platform.summary)}</p><p class="muted">Common parts: ${escapeHtml(commonParts)}</p>
    ${platform.websiteUrl ? `<a class="button button-primary" href="${platform.websiteUrl}" target="_blank" rel="noopener noreferrer">Visit platform website</a>` : ""}
    <h3>Rating breakdown</h3>
    ${[5,4,3,2,1].map((rating, index) => `<div class="breakdown-row"><span>${rating} stars</span><div class="breakdown-bar"><span style="width:${stats.breakdown[index]}%"></span></div><span>${stats.breakdown[index]}%</span></div>`).join("")}
    <h3>User reviews</h3>
    ${reviews.length ? `<div class="review-list">${reviews.map((review) => `<article class="review-card">${starRating(review.overallRating || review.itemRating, false)}<strong>${escapeHtml(review.partName || "Car part purchase")}</strong><p>${escapeHtml(review.reviewText || "No written review added.")}</p><p class="muted">${escapeHtml(vehicleSummary({ year: review.vehicleYear, make: review.vehicleMake, model: review.vehicleModel }))} · ${escapeHtml(firestoreDate(review.createdAt))}</p></article>`).join("")}</div>` : `<div class="empty-state">No user reviews yet. Ratings will appear once users start reviewing this platform.</div>`}
  </article>`;
}

async function loadCollection(path, orderField) {
  if (!currentUser) return [];
  const q = query(collection(db, "users", currentUser.uid, path), orderBy(orderField, "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

function historyPayload(item = {}) {
  const fallbackResults = createSearchResults({
    vehicle: item.vehicle || {},
    selectedPart: item.selectedPart || null,
    partNumber: item.partNumber || "",
    rawQuery: item.rawQuery || "",
  });
  return {
    id: item.id || `srch_${Date.now()}`,
    searchType: item.searchType || "vehicle_part",
    rawQuery: item.rawQuery || partSummary(item),
    generatedSearchTerms: item.generatedSearchTerms || [item.rawQuery].filter(Boolean),
    vehicle: item.vehicle || null,
    selectedPart: item.selectedPart || null,
    partNumber: item.partNumber || null,
    results: Array.isArray(item.results) && item.results.length ? item.results : fallbackResults,
    totalResults: item.resultsCount || item.results?.length || fallbackResults.length,
    provider: item.provider || "history",
    savedHistoryId: item.id,
  };
}

function renderHistoryList(history = []) {
  const grid = $("#historyGrid");
  if (!grid) return;
  const queryText = ($("#historySearch")?.value || "").toLowerCase().trim();
  const statusFilter = $("#historyStatusFilter")?.value || "";
  const filtered = history.filter((item) => {
    const text = `${item.rawQuery || ""} ${partSummary(item)} ${vehicleSummary(item.vehicle || {})} ${item.partNumber || ""}`.toLowerCase();
    const statusMatches = !statusFilter || (item.purchaseStatus || "still_looking") === statusFilter;
    return statusMatches && (!queryText || text.includes(queryText));
  });

  $("#historyTotal") && ($("#historyTotal").textContent = String(history.length));
  $("#historyBought") && ($("#historyBought").textContent = String(history.filter((item) => item.purchaseStatus === "bought").length));
  $("#historyLooking") && ($("#historyLooking").textContent = String(history.filter((item) => (item.purchaseStatus || "still_looking") === "still_looking").length));

  if (!history.length) {
    grid.innerHTML = `<div class="empty-state">No searches saved yet. Run a search, then use Save Search on the results page.</div>`;
    return;
  }
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">No saved searches match those filters.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((item) => {
    const status = item.purchaseStatus || "still_looking";
    return `<article class="history-card history-list-card">
      <div class="history-card-header">
        <div>
          <p class="eyebrow">${escapeHtml(searchTypeLabel(item.searchType))}</p>
          <h3>${escapeHtml(item.rawQuery || partSummary(item))}</h3>
          <p class="muted">${escapeHtml(vehicleSummary(item.vehicle || {}))}</p>
        </div>
        <span class="status-badge">${escapeHtml(purchaseStatusLabel(status))}</span>
      </div>
      <div class="history-detail-grid">
        <span><strong>${escapeHtml(partSummary(item))}</strong><small>Part searched</small></span>
        <span><strong>${escapeHtml(firestoreDate(item.searchedAt))}</strong><small>Date searched</small></span>
        <span><strong>${Number(item.resultsCount || item.results?.length || 0)}</strong><small>Results saved</small></span>
        <span><strong>${escapeHtml(item.provider || "PartHunt")}</strong><small>Provider</small></span>
      </div>
      <label class="history-status-control">
        <span>Purchase status</span>
        <select data-history-status="${item.id}">
          ${[
            ["still_looking", "Still looking"],
            ["found_not_bought", "Found but not bought"],
            ["bought", "Bought"],
            ["could_not_find", "Could not find item"],
            ["no_longer_needed", "No longer needed"],
          ].map(([value, label]) => `<option value="${value}" ${value === status ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </label>
      <div class="history-card-actions">
        <button class="button button-secondary" type="button" data-view-history="${item.id}">View Results</button>
        <button class="button button-ghost" type="button" data-rerun-history="${item.id}">Search Again</button>
        <button class="button button-primary" type="button" data-review-history="${item.id}">Leave Review</button>
      </div>
    </article>`;
  }).join("");

  grid.querySelectorAll("[data-view-history]").forEach((button) => button.addEventListener("click", () => {
    const item = history.find((entry) => entry.id === button.dataset.viewHistory);
    if (!item) return;
    sessionStorage.setItem("parthunt-current-search", JSON.stringify(historyPayload(item)));
    location.href = "/search/results/demo-search/";
  }));
  grid.querySelectorAll("[data-rerun-history]").forEach((button) => button.addEventListener("click", () => {
    const item = history.find((entry) => entry.id === button.dataset.rerunHistory);
    if (!item) return;
    runSearch(historyPayload(item));
  }));
  grid.querySelectorAll("[data-review-history]").forEach((button) => button.addEventListener("click", () => {
    const item = history.find((entry) => entry.id === button.dataset.reviewHistory);
    if (!item) return;
    sessionStorage.setItem("parthunt-review-history", JSON.stringify(historyPayload(item)));
    location.href = "/reviews/new/demo-history/";
  }));
  grid.querySelectorAll("[data-history-status]").forEach((select) => select.addEventListener("change", async () => {
    select.disabled = true;
    try {
      await updateDoc(doc(db, "users", currentUser.uid, "searchHistory", select.dataset.historyStatus), {
        purchaseStatus: select.value,
        updatedAt: serverTimestamp(),
      });
      const item = history.find((entry) => entry.id === select.dataset.historyStatus);
      if (item) item.purchaseStatus = select.value;
      renderHistoryList(history);
    } catch (error) {
      console.error(error);
      select.disabled = false;
    }
  }));
}

function reviewSearchContext() {
  return JSON.parse(sessionStorage.getItem("parthunt-review-history") || "null")
    || JSON.parse(sessionStorage.getItem("parthunt-current-search") || "null")
    || null;
}

function initReviewPage() {
  const reviewSearch = reviewSearchContext();
  const platforms = uniquePlatformsFromResults(reviewSearch?.results || []);
  const platformSelect = $("#platformName");
  if (!platformSelect) return;
  const fallbackPlatforms = platforms.length ? platforms : demoPlatforms.map((platform) => ({
    id: platform.id,
    slug: platform.slug,
    name: platform.name,
    category: platform.category,
    logoUrl: platform.logoUrl,
    listingUrl: platform.websiteUrl || "",
  }));
  platformSelect.innerHTML = fallbackPlatforms.map((platform) => `<option value="${escapeHtml(platform.name)}" data-platform-id="${escapeHtml(platform.id)}" data-platform-slug="${escapeHtml(platform.slug || platform.id)}" data-category="${escapeHtml(platform.category)}" data-listing-url="${escapeHtml(platform.listingUrl)}">${escapeHtml(platform.name)} · ${escapeHtml(platform.category)}</option>`).join("");
  const context = $("#reviewContext");
  if (context) {
    context.innerHTML = reviewSearch ? `
      <div class="review-context-card">
        <p class="eyebrow">Review linked to saved search</p>
        <h2>${escapeHtml(reviewSearch.rawQuery || partSummary(reviewSearch))}</h2>
        <p class="muted">${escapeHtml(vehicleSummary(reviewSearch.vehicle || {}))}</p>
      </div>
    ` : `<div class="empty-state">No saved search context found. Choose from known platforms below.</div>`;
  }
  const syncSelectedPlatform = () => {
    const option = platformSelect.selectedOptions[0];
    if (!option) return;
    $("#reviewListingUrl") && ($("#reviewListingUrl").value = option.dataset.listingUrl || "");
  };
  platformSelect.addEventListener("change", syncSelectedPlatform);
  syncSelectedPlatform();
}

async function initProtectedPages() {
  if (!["dashboard", "history", "saved-parts", "settings", "review-new"].includes(page)) return;
  if (!currentUser) {
    $(".protected-content") && ($(".protected-content").innerHTML = `<div class="empty-state">Sign in to access this page. <a class="button button-primary" href="/sign-in/">Sign In</a></div>`);
    return;
  }
  if (page === "dashboard") {
    const history = await loadCollection("searchHistory", "searchedAt").catch(() => []);
    const saved = await loadCollection("savedParts", "savedAt").catch(() => []);
    $("#dashboardContent").innerHTML = `<div class="dashboard-stats"><article><strong>${history.length}</strong><span>Searches</span></article><article><strong>${saved.length}</strong><span>Saved parts</span></article><article><strong>${history.filter((item) => item.purchaseStatus === "bought").length}</strong><span>Bought items</span></article><article><strong>3</strong><span>Review reminders</span></article></div>`;
  }
  if (page === "history") {
    const history = await loadCollection("searchHistory", "searchedAt").catch(() => []);
    renderHistoryList(history);
    $("#historySearch")?.addEventListener("input", () => renderHistoryList(history));
    $("#historyStatusFilter")?.addEventListener("change", () => renderHistoryList(history));
  }
  if (page === "saved-parts") {
    const saved = await loadCollection("savedParts", "savedAt").catch(() => []);
    $("#savedGrid").innerHTML = saved.length ? saved.map((item) => `<article class="result-card"><div class="result-image">${item.platformName}</div><div class="result-body"><h3>${item.title}</h3><p class="price">${item.price}</p><a class="button button-primary" href="${item.listingUrl}" target="_blank" rel="noopener noreferrer">Exact listing link</a><button class="button button-ghost" data-remove="${item.id}">Remove</button></div></article>`).join("") : `<div class="empty-state">No saved parts yet.</div>`;
    $("#savedGrid").querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", async () => {
      await deleteDoc(doc(db, "users", currentUser.uid, "savedParts", button.dataset.remove));
      location.reload();
    }));
  }
  if (page === "settings") {
    $("#settingsEmail").textContent = currentUser.email || "";
    $("#settingsUid").textContent = currentUser.uid;
  }
  if (page === "review-new") {
    initReviewPage();
    $("#reviewForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const option = $("#platformName").selectedOptions[0];
      const itemRating = Number($("#itemRating").value);
      const deliveryRating = $("#deliveryRating").value ? Number($("#deliveryRating").value) : null;
      const overallRating = deliveryRating ? (itemRating + deliveryRating) / 2 : itemRating;
      const reviewSearch = reviewSearchContext();
      const review = withoutUndefined({
        userId: currentUser.uid,
        searchHistoryId: reviewSearch?.savedHistoryId || reviewSearch?.id || "",
        platformId: option?.dataset.platformId || slugify($("#platformName").value),
        platformSlug: option?.dataset.platformSlug || slugify($("#platformName").value),
        platformName: $("#platformName").value,
        platformCategory: option?.dataset.category || "",
        partName: partSummary(reviewSearch || {}),
        vehicleMake: reviewSearch?.vehicle?.make || "",
        vehicleModel: reviewSearch?.vehicle?.model || "",
        vehicleYear: reviewSearch?.vehicle?.year || "",
        listingUrl: $("#reviewListingUrl").value.trim(),
        pricePaid: $("#reviewPricePaid").value ? Number($("#reviewPricePaid").value) : null,
        itemCondition: $("#reviewItemCondition").value,
        boughtItem: $("#boughtItem").value === "yes",
        itemRating,
        deliveryRating,
        overallRating,
        reviewText: $("#reviewText").value,
        wouldBuyAgain: $("#wouldBuyAgain").checked,
      });
      const reviewWithTimestamp = {
        ...review,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", currentUser.uid, "platformReviews", review.searchHistoryId || `${review.platformSlug}-${Date.now()}`), reviewWithTimestamp);
      await addDoc(collection(db, "platformReviews"), reviewWithTimestamp);
      location.href = "/history/";
    });
  }
}

function initPage() {
  renderPlatformCards();
  initPlatformCarousel();
  initPlatformDirectory();
  initAuthPages();
  initPartSearch();
  initVehicleSearch();
  initVehicleModel();
  initResults();
  initPlatformProfile();
}

renderShell();
setTheme();
wireShell();
initPage();

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const firstName = user ? (user.displayName || user.email || "User").split(/[ @]/)[0] : "User";
  $("#userStatus").textContent = firstName;
  $("#navSignIn").classList.toggle("hidden", Boolean(user));
  $("#navSignUp").classList.toggle("hidden", Boolean(user));
  $("#accountMenu").classList.toggle("hidden", !user);
  if (user && ["sign-in", "sign-up"].includes(page)) {
    pendingRedirectAfterAuth = true;
    location.href = "/";
    return;
  }
  if (user) {
    try {
      await setDoc(doc(db, "users", user.uid), { email: user.email || "", name: user.displayName || "", updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.warn("User profile could not be synced. Deploy the latest Firestore rules.", error);
    }
    const pending = JSON.parse(sessionStorage.getItem("parthunt-pending-action") || "null");
    sessionStorage.removeItem("parthunt-pending-action");
    if (pending?.type === "openListing") window.open(pending.url, "_blank", "noopener,noreferrer");
    if (pending?.type === "runSearch") runSearch(pending.search);
    if (pending?.type === "saveSearch") {
      const savedId = await saveSearch({
        searchType: pending.search.searchType,
        rawQuery: pending.search.rawQuery,
        generatedSearchTerms: pending.search.generatedSearchTerms || [pending.search.rawQuery],
        vehicle: pending.search.vehicle || null,
        selectedPart: pending.search.selectedPart || null,
        partNumber: pending.search.partNumber || null,
        provider: pending.search.provider || "",
        results: pending.search.results || [],
        resultsCount: pending.search.results?.length || 0,
      });
      pending.search.savedHistoryId = savedId;
      sessionStorage.setItem("parthunt-current-search", JSON.stringify(pending.search));
      location.href = "/search/results/demo-search/";
    }
  }
  if (!pendingRedirectAfterAuth) await initProtectedPages();
});
