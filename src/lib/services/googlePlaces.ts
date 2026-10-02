import { Prospect } from "@/types";

interface GooglePlaceAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode?: string;
}

interface GooglePlace {
  id: string;
  displayName?: {
    text: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  addressComponents?: GooglePlaceAddressComponent[];
  websiteUri?: string;
  nationalPhoneNumber?: string;
  types?: string[];
}

interface GooglePlacesSearchResponse {
  places?: GooglePlace[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Maps Google Places type string to a professional human-readable business classification
 */
function formatPlaceType(typeString?: string): string {
  if (!typeString) return "Home Decor Retailer";
  const mapped: Record<string, string> = {
    home_goods_store: "Home Goods Store",
    furniture_store: "Furniture & Decor Store",
    interior_designer: "Interior Design Studio",
    gift_shop: "Gift & Lifestyle Boutique",
    art_gallery: "Art Gallery & Decor",
    department_store: "Department Store",
    lighting_store: "Lighting & Home Accessories",
    florist: "Botanical & Floral Studio",
    hardware_store: "Hardware & Home Supply",
  };

  if (mapped[typeString]) return mapped[typeString];

  // Convert snake_case to Title Case (excluding generic tags)
  if (typeString === "establishment" || typeString === "point_of_interest" || typeString === "store") {
    return "Home Decor & Lifestyle";
  }

  return typeString
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Parses city and state from Google address components with fallback to formatted address
 */
function extractCityAndState(
  addressComponents?: GooglePlaceAddressComponent[],
  formattedAddress?: string
): { city: string; state: string } {
  let city = "";
  let state = "";

  if (addressComponents && Array.isArray(addressComponents)) {
    for (const comp of addressComponents) {
      if (!comp || !Array.isArray(comp.types)) continue;

      if (comp.types.includes("locality")) {
        city = comp.longText || comp.shortText || "";
      } else if (!city && comp.types.includes("sublocality_level_1")) {
        city = comp.longText || comp.shortText || "";
      } else if (!city && comp.types.includes("neighborhood")) {
        city = comp.longText || comp.shortText || "";
      }

      if (comp.types.includes("administrative_area_level_1")) {
        state = comp.shortText || comp.longText || "";
      }
    }
  }

  // Fallback parsing from formattedAddress (e.g. "123 Main St, Brooklyn, NY 11201, USA")
  if ((!city || !state) && formattedAddress) {
    const parts = formattedAddress.split(",").map((s) => s.trim());
    if (parts.length >= 3) {
      if (!city) {
        city = parts[parts.length - 3] || "";
      }
      if (!state) {
        const stateZip = parts[parts.length - 2] || "";
        const stateMatch = stateZip.match(/([A-Z]{2})\b/);
        if (stateMatch) {
          state = stateMatch[1];
        }
      }
    }
  }

  return {
    city: city || "Unknown City",
    state: state || "US",
  };
}

/**
 * Builds the search query string from user inputs
 */
export function buildPlacesQuery(
  productCategory: string,
  targetMarket: string,
  businessType?: string
): string {
  const categoryClean = (productCategory || "").trim();
  const marketClean = (targetMarket || "").trim();

  if (businessType && businessType !== "all") {
    return `${businessType} selling ${categoryClean} in ${marketClean}`;
  }

  // If category already has commercial intent words
  if (/\b(store|shop|boutique|studio|showroom|retailer|goods)\b/i.test(categoryClean)) {
    return `${categoryClean} in ${marketClean}`;
  }

  return `${categoryClean} stores in ${marketClean}`;
}

/**
 * Factual relevance explanation based purely on place metadata and target location.
 * Does not make unsubstantiated claims of buyer intent.
 */
function generateRelevanceExplanation(
  businessType: string,
  city: string,
  state: string,
  productCategory: string
): string {
  const locationLabel = city && state !== "US" ? `${city}, ${state}` : city || state;
  return `${businessType} located in ${locationLabel}, identified through commercial directory search for ${productCategory}.`;
}

/**
 * Queries Google Places API (New) Text Search and normalizes results into Prospect[]
 */
export async function searchGooglePlaces(
  productCategory: string,
  targetMarket: string,
  businessType?: string,
  apiKey?: string
): Promise<Prospect[]> {
  const key = apiKey || process.env.GOOGLE_PLACES_API_KEY;

  if (!key) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured on the server.");
  }

  const query = buildPlacesQuery(productCategory, targetMarket, businessType);

  const endpoint = "https://places.googleapis.com/v1/places:searchText";

  const requestBody = {
    textQuery: query,
    pageSize: 15,
    languageCode: "en",
  };

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.addressComponents",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.types",
  ].join(",");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Google Places API returned HTTP ${response.status}:`, errorText);
    let parsedMessage = `Google Places API request failed with status ${response.status}`;
    try {
      const parsedError = JSON.parse(errorText);
      if (parsedError?.error?.message) {
        parsedMessage = parsedError.error.message;
      }
    } catch {
      // Use fallback error message
    }
    throw new Error(parsedMessage);
  }

  const data = (await response.json()) as GooglePlacesSearchResponse;
  const rawPlaces = data.places || [];

  const prospects: Prospect[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  for (const place of rawPlaces) {
    if (!place.id) continue;

    // Deduplication check
    const normalizedName = (place.displayName?.text || "").toLowerCase().trim();
    if (seenIds.has(place.id) || (normalizedName && seenNames.has(normalizedName))) {
      continue;
    }
    seenIds.add(place.id);
    if (normalizedName) seenNames.add(normalizedName);

    const businessName = place.displayName?.text || "Unknown Retailer";
    const address = place.formattedAddress || "Address unlisted";
    const { city, state } = extractCityAndState(place.addressComponents, place.formattedAddress);

    // Filter relevant primary business type
    const placeTypes = Array.isArray(place.types) ? place.types : [];
    const primaryType = placeTypes.find(
      (t) => t !== "establishment" && t !== "point_of_interest" && t !== "store"
    ) || placeTypes[0];

    const formattedType = formatPlaceType(primaryType);
    const category = placeTypes.length ? formatPlaceType(placeTypes[0]) : "Retail Store";

    const website = place.websiteUri || null;
    const phone = place.nationalPhoneNumber || null;

    const relevance = generateRelevanceExplanation(formattedType, city, state, productCategory || "");

    prospects.push({
      id: place.id,
      businessName,
      businessType: formattedType,
      category,
      city,
      state,
      address,
      website,
      contact: {
        email: null, // Email enrichment will be integrated in subsequent milestone phase
        phone,
        contactPerson: null,
        contactRole: null,
        hasVerifiedEmail: false,
      },
      relevanceExplanation: relevance,
      source: "Google Places API (New)",
      discoveredAt: new Date().toISOString(),
    });
  }

  return prospects;
}
