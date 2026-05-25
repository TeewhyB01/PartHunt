const { searchPartsLive } = require("../functions/search-parts.cjs");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ message: "Use POST." });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const result = await searchPartsLive(body, {
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
