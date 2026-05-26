function normaliseRegistration(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function vehicleFromDvlaResponse(body) {
  return {
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
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ message: "Use POST." });
    return;
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  const registrationNumber = normaliseRegistration(body.registrationNumber);

  if (!/^[A-Z0-9]{2,8}$/.test(registrationNumber)) {
    response.status(400).json({ message: "Enter a valid UK registration number without spaces or symbols." });
    return;
  }

  const apiKey = process.env.DVLA_API_KEY;
  if (!apiKey) {
    response.status(500).json({ message: "DVLA lookup is not configured yet." });
    return;
  }

  try {
    const dvlaResponse = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ registrationNumber }),
    });
    const dvlaBody = await dvlaResponse.json().catch(() => ({}));

    if (!dvlaResponse.ok) {
      response.status(dvlaResponse.status).json({
        message: dvlaBody.errors?.[0]?.detail || dvlaBody.message || "DVLA vehicle lookup failed.",
        errors: dvlaBody.errors || [],
      });
      return;
    }

    response.status(200).json({ vehicle: vehicleFromDvlaResponse(dvlaBody) });
  } catch (error) {
    response.status(502).json({ message: "Could not reach DVLA Vehicle Enquiry Service." });
  }
};
