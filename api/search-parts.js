const { searchPartsWithSerpApi } = require("../functions/search-parts.cjs");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ message: "Use POST." });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
    const result = await searchPartsWithSerpApi(body, process.env.SERPAPI_KEY || process.env.SERP_API_KEY);
    response.status(200).json(result);
  } catch (error) {
    response.status(error.statusCode || 500).json({
      message: error.message || "Search failed.",
      provider: "serpapi",
    });
  }
};
