class RentCastService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("RENTCAST_API_KEY is missing at runtime");
    }

    this.apiKey = apiKey;
    this.baseUrl = "https://api.rentcast.io/v1";
  }

  async getPropertyDetails(address) {
    const url = new URL(`${this.baseUrl}/properties`);
    url.searchParams.append("address", address);

    const response = await fetch(url.toString(), {
      headers: {
        "X-Api-Key": this.apiKey,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || !data.length) return null;

    const p = data[0];
    return {
      address: p.formattedAddress || address,
      squareFootage: p.squareFootage || null,
      bedrooms: p.bedrooms || null,
      bathrooms: p.bathrooms || null,
      yearBuilt: p.yearBuilt || null,
      propertyType: p.propertyType || "Unknown",
      latitude: p.latitude || null,
      longitude: p.longitude || null,
    };
  }
}

module.exports = RentCastService;
