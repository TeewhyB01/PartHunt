const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { searchPartsLive } = require("./search-parts.cjs");

const dvlaApiKey = defineSecret("DVLA_API_KEY");
const serpApiKey = defineSecret("SERPAPI_KEY");
const ebayClientId = defineSecret("EBAY_CLIENT_ID");
const ebayClientSecret = defineSecret("EBAY_CLIENT_SECRET");

function normaliseRegistration(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

exports.vehicleLookup = onRequest({ secrets: [dvlaApiKey], cors: true, region: "europe-west2" }, async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ message: "Use POST." });
    return;
  }

  const registrationNumber = normaliseRegistration(request.body && request.body.registrationNumber);
  if (!/^[A-Z0-9]{2,8}$/.test(registrationNumber)) {
    response.status(400).json({ message: "Enter a valid UK registration number without spaces or symbols." });
    return;
  }

  try {
    const dvlaResponse = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": dvlaApiKey.value(),
      },
      body: JSON.stringify({ registrationNumber }),
    });
    const body = await dvlaResponse.json().catch(() => ({}));
    if (!dvlaResponse.ok) {
      response.status(dvlaResponse.status).json({
        message: body.errors && body.errors[0] ? body.errors[0].detail : "DVLA vehicle lookup failed.",
        errors: body.errors || [],
      });
      return;
    }
    response.json({
      vehicle: {
        registrationNumber: body.registrationNumber,
        make: body.make,
        model: body.model || "",
        yearOfManufacture: body.yearOfManufacture,
        fuelType: body.fuelType,
        engineCapacity: body.engineCapacity,
        colour: body.colour,
        motStatus: body.motStatus,
        taxStatus: body.taxStatus,
        wheelplan: body.wheelplan,
        typeApproval: body.typeApproval,
        source: "DVLA Vehicle Enquiry Service",
      },
    });
  } catch (error) {
    response.status(502).json({ message: "Could not reach DVLA Vehicle Enquiry Service." });
  }
});

exports.searchParts = onRequest({ secrets: [serpApiKey, ebayClientId, ebayClientSecret], cors: true, region: "europe-west2" }, async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ message: "Use POST." });
    return;
  }

  try {
    const result = await searchPartsLive(request.body || {}, {
      serpApiKey: serpApiKey.value(),
      ebayClientId: ebayClientId.value(),
      ebayClientSecret: ebayClientSecret.value(),
    });
    response.json(result);
  } catch (error) {
    response.status(error.statusCode || 500).json({
      message: error.message || "Search failed.",
      provider: "live-search",
    });
  }
});
