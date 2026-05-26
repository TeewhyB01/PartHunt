const { searchPartsLive } = require("../functions/search-parts.cjs");

function firstHeader(headers = {}, names = []) {
  for (const name of names) {
    const value = headers[name] || headers[name.toLowerCase()];
    if (Array.isArray(value) && value[0]) return value[0];
    if (value) return value;
  }
  return "";
}

function inferRequestCountry(request, body = {}) {
  return body.country
    || body.vehicle?.country
    || firstHeader(request.headers, ["x-vercel-ip-country", "cf-ipcountry", "x-country-code"])
    || "";
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ message: "Use POST." });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const result = await searchPartsLive({ ...body, country: inferRequestCountry(request, body) }, {
      serpApiKey: process.env.SERPAPI_KEY || process.env.SERP_API_KEY,
      ebayClientId: process.env.EBAY_CLIENT_ID,
      ebayClientSecret: process.env.EBAY_CLIENT_SECRET,
    });
    response.status(200).json(result);
  } catch (error) {
    response.status(error.statusCode || 500).json({
      message: error.message || "Search failed.",
      provider: "live-search",
    });
  }
};
