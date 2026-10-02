import { Prospect } from "@/types";

/**
 * =========================================================================
 * DEVELOPMENT-ONLY MOCK DATA
 * =========================================================================
 * Notice: This dataset is provided solely for local UI development and workflow
 * validation prior to external API integration.
 *
 * In accordance with project data integrity standards:
 * - Domain names utilize RFC 2606 reserved '.example.com' or mock endpoints.
 * - These listings represent simulated business prospects for testing UI
 *   filtering, selection, and outreach composition.
 * - Businesses are labeled as potential prospects, never guaranteed buyers.
 * =========================================================================
 */

export const IS_DEVELOPMENT_MOCK = true;

export const DEVELOPMENT_ONLY_MOCK_PROSPECTS: Prospect[] = [
  {
    id: "prospect-ny-01",
    businessName: "Modern Habitat & Living",
    businessType: "Home Furnishings & Decor",
    category: "Retail Boutique",
    city: "Brooklyn",
    state: "NY",
    address: "142 Atlantic Ave, Brooklyn, NY 11201",
    website: "https://www.modernhabitat-decor.example.com",
    contact: {
      email: "wholesale@modernhabitat-decor.example.com",
      phone: "+1 (718) 555-0142",
      contactPerson: "Elena Vance",
      contactRole: "Lead Merchandiser",
      hasVerifiedEmail: true,
      socialHandles: {
        instagram: "@modernhabitat_bk",
      },
    },
    relevanceExplanation:
      "Independent home furnishings retailer stocking handcrafted ceramics, wall accents, and tabletop goods from regional makers.",
    source: "US Retail Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-ny-02",
    businessName: "Oak & Stone Interior Studio",
    businessType: "Interior Design Studio & Showroom",
    category: "Design Services & Sourcing",
    city: "New York",
    state: "NY",
    address: "580 Broadway, Ste 402, New York, NY 10012",
    website: "https://www.oakandstone-interiors.example.com",
    contact: {
      email: null,
      phone: "+1 (212) 555-0198",
      contactPerson: "Marcus Brody",
      contactRole: "Principal Designer",
      hasVerifiedEmail: false,
    },
    relevanceExplanation:
      "Boutique residential interior design firm sourcing custom decor items, artisan lighting, and statement textiles for client projects.",
    source: "US Architectural & Design Registry (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-ny-03",
    businessName: "Hudson Valley Goods & Flora",
    businessType: "Gift & Lifestyle Boutique",
    category: "Retail Boutique",
    city: "Beacon",
    state: "NY",
    address: "216 Main St, Beacon, NY 12508",
    website: "https://www.hudsonvalleygoods.example.com",
    contact: {
      email: "buyer@hudsonvalleygoods.example.com",
      phone: "+1 (845) 555-0210",
      contactPerson: "Clara Bennett",
      contactRole: "Owner / Buyer",
      hasVerifiedEmail: true,
      socialHandles: {
        instagram: "@hudsonvalleygoods",
      },
    },
    relevanceExplanation:
      "Curated lifestyle boutique featuring handmade home goods, artisanal ceramics, and natural woven textiles from independent US studios.",
    source: "US Retail Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-ny-04",
    businessName: "Atelier Mercer",
    businessType: "Home Decor & Furnishings",
    category: "Specialty Store",
    city: "New York",
    state: "NY",
    address: "74 Mercer St, New York, NY 10012",
    website: "https://www.ateliermercer-decor.example.com",
    contact: {
      email: "procurement@ateliermercer-decor.example.com",
      phone: "+1 (212) 555-0322",
      contactPerson: "Julian Croft",
      contactRole: "Retail Director",
      hasVerifiedEmail: true,
    },
    relevanceExplanation:
      "SoHo boutique focused on contemporary minimalist decor, sculpted objects, and studio-crafted functional art.",
    source: "US Retail Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-ny-05",
    businessName: "Cobble Hill Artisan Collective",
    businessType: "Gift & Lifestyle Boutique",
    category: "Co-op / Collective",
    city: "Brooklyn",
    state: "NY",
    address: "312 Court St, Brooklyn, NY 11231",
    website: "https://www.cobblehillcollective.example.com",
    contact: {
      email: null,
      phone: "+1 (718) 555-0455",
      contactPerson: null,
      contactRole: null,
      hasVerifiedEmail: false,
    },
    relevanceExplanation:
      "Neighborhood retail showcase representing American artisans in home goods, ceramics, candles, and decorative hardware.",
    source: "US Small Business Administration Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-ny-06",
    businessName: "Found & Form Gallery",
    businessType: "Interior Design Studio & Showroom",
    category: "Showroom",
    city: "Long Island City",
    state: "NY",
    address: "43-01 21st St, Long Island City, NY 11101",
    website: "https://www.foundandform.example.com",
    contact: {
      email: "info@foundandform.example.com",
      phone: "+1 (718) 555-0789",
      contactPerson: "Siddharth Rao",
      contactRole: "Curator",
      hasVerifiedEmail: true,
      socialHandles: {
        instagram: "@foundandformlic",
      },
    },
    relevanceExplanation:
      "Architectural trade showroom connecting hospitality designers with small-batch decor and lighting fabricators.",
    source: "US Trade Guild Registry (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-tx-01",
    businessName: "South Congress Living",
    businessType: "Home Furnishings & Decor",
    category: "Retail Boutique",
    city: "Austin",
    state: "TX",
    address: "1604 S Congress Ave, Austin, TX 78704",
    website: "https://www.socohomeliving.example.com",
    contact: {
      email: "partnerships@socohomeliving.example.com",
      phone: "+1 (512) 555-0812",
      contactPerson: "Amelia Hayes",
      contactRole: "Founder & Merchandising Head",
      hasVerifiedEmail: true,
      socialHandles: {
        instagram: "@socohomeliving",
      },
    },
    relevanceExplanation:
      "Boutique retail shop curating Southwestern modern home accessories, handmade ceramics, and botanical decor.",
    source: "US Retail Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-tx-02",
    businessName: "Lone Star Interior Supply",
    businessType: "Interior Design Studio & Showroom",
    category: "Trade Supplier",
    city: "Dallas",
    state: "TX",
    address: "1025 N Stemmons Fwy, Dallas, TX 75207",
    website: "https://www.lonestardesignsupply.example.com",
    contact: {
      email: "vendor-desk@lonestardesignsupply.example.com",
      phone: "+1 (214) 555-0630",
      contactPerson: "Garrett Cole",
      contactRole: "Vendor Relations",
      hasVerifiedEmail: true,
    },
    relevanceExplanation:
      "Design district trade resource providing custom wall decor, accent furniture, and artisan decor to commercial designers.",
    source: "Dallas Design District Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-ca-01",
    businessName: "Silver Lake Crafted",
    businessType: "Gift & Lifestyle Boutique",
    category: "Retail Boutique",
    city: "Los Angeles",
    state: "CA",
    address: "3820 Sunset Blvd, Los Angeles, CA 90026",
    website: "https://www.silverlakecrafted.example.com",
    contact: {
      email: "hello@silverlakecrafted.example.com",
      phone: "+1 (323) 555-0199",
      contactPerson: "Chloe Nguyen",
      contactRole: "Store Owner",
      hasVerifiedEmail: true,
      socialHandles: {
        instagram: "@silverlakecrafted",
      },
    },
    relevanceExplanation:
      "Neighborhood retail boutique featuring ceramics, minimalist home accessories, and ethically made wall hangings.",
    source: "US Retail Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-ca-02",
    businessName: "Pacifica Home & Patio",
    businessType: "Home Furnishings & Decor",
    category: "Retail Store",
    city: "Santa Monica",
    state: "CA",
    address: "1240 Montana Ave, Santa Monica, CA 90403",
    website: "https://www.pacificahome.example.com",
    contact: {
      email: null,
      phone: "+1 (310) 555-0941",
      contactPerson: "Brett Taylor",
      contactRole: "General Manager",
      hasVerifiedEmail: false,
    },
    relevanceExplanation:
      "Coastal lifestyle store featuring earthy textures, ceramic tabletop collections, and indoor-outdoor decorative accessories.",
    source: "California Business Registry (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-il-01",
    businessName: "Wicker Park Design Collective",
    businessType: "Home Furnishings & Decor",
    category: "Retail Boutique",
    city: "Chicago",
    state: "IL",
    address: "1418 N Milwaukee Ave, Chicago, IL 60622",
    website: "https://www.wickerparkcollective.example.com",
    contact: {
      email: "buyers@wickerparkcollective.example.com",
      phone: "+1 (773) 555-0184",
      contactPerson: "Dana Weiss",
      contactRole: "Co-founder",
      hasVerifiedEmail: true,
      socialHandles: {
        instagram: "@wickerparkcollective",
      },
    },
    relevanceExplanation:
      "Independent Chicago boutique that stocks Midwest and US indie home decor brands, ceramics, textiles, and functional art.",
    source: "US Retail Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
  {
    id: "prospect-wa-01",
    businessName: "Ballard Modern Home",
    businessType: "Home Furnishings & Decor",
    category: "Retail Store",
    city: "Seattle",
    state: "WA",
    address: "5310 Ballard Ave NW, Seattle, WA 98107",
    website: "https://www.ballardmodernhome.example.com",
    contact: {
      email: "inventory@ballardmodernhome.example.com",
      phone: "+1 (206) 555-0477",
      contactPerson: "Nora Lindqvist",
      contactRole: "Buyer",
      hasVerifiedEmail: true,
      socialHandles: {
        instagram: "@ballardmodernhome",
      },
    },
    relevanceExplanation:
      "Scandinavian-inspired home decor shop that partners with craftspeople producing sustainable woodwork, ceramics, and textiles.",
    source: "US Retail Directory (Simulated API)",
    discoveredAt: "2026-09-28T14:32:00Z",
  },
];

/**
 * Filter simulation function to simulate server-side / API query responses
 */
export function queryMockProspects(
  productCategory: string,
  targetMarket: string,
  businessType?: string,
  hasEmailOnly?: boolean
): Prospect[] {
  let results = [...DEVELOPMENT_ONLY_MOCK_PROSPECTS];

  // If user searched for a specific market/location
  if (targetMarket && targetMarket.trim().length > 0) {
    const marketTerms = targetMarket.toLowerCase().split(/[\s,]+/);
    results = results.filter((p) => {
      const city = p.city.toLowerCase();
      const state = p.state.toLowerCase();
      const address = p.address.toLowerCase();
      return marketTerms.some(
        (term) =>
          term.length > 1 &&
          (city.includes(term) || state.includes(term) || address.includes(term))
      );
    });

    // If strict filter yielded no results, return regional matches or default set to avoid empty experience during demo
    if (results.length === 0) {
      results = DEVELOPMENT_ONLY_MOCK_PROSPECTS.slice(0, 6);
    }
  }

  // Filter by business type if selected
  if (businessType && businessType !== "all") {
    results = results.filter(
      (p) =>
        p.businessType.toLowerCase().includes(businessType.toLowerCase()) ||
        p.category.toLowerCase().includes(businessType.toLowerCase())
    );
  }

  // Filter by verified email
  if (hasEmailOnly) {
    results = results.filter((p) => p.contact.hasVerifiedEmail);
  }

  return results;
}
