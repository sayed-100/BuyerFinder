import { NextRequest, NextResponse } from "next/server";
import { SearchRequest, SearchResponse } from "@/types";
import { queryMockProspects, IS_DEVELOPMENT_MOCK } from "@/lib/mockData";
import { searchGooglePlaces } from "@/lib/services/googlePlaces";
import { enrichProspectsWithPublicEmails } from "@/lib/services/enrichment/publicWebsiteEmail";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SearchRequest;

    if (!body.productCategory || !body.targetMarket) {
      return NextResponse.json(
        { error: "Product category and target market are required." },
        { status: 400 }
      );
    }

    const isRealApiEnabled = process.env.ENABLE_REAL_APIS === "true";
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

    // Real API Mode: Google Places API (New) + Public Website Email Discovery
    if (isRealApiEnabled) {
      if (!googleApiKey || googleApiKey.trim().length === 0) {
        console.error(
          "ENABLE_REAL_APIS is set to true, but GOOGLE_PLACES_API_KEY is not configured."
        );
        return NextResponse.json(
          {
            error:
              "Google Places API key is missing. Set GOOGLE_PLACES_API_KEY in your environment variables to enable real business discovery.",
            isMockData: false,
          },
          { status: 500 }
        );
      }

      try {
        const rawProspects = await searchGooglePlaces(
          body.productCategory,
          body.targetMarket,
          body.businessType,
          googleApiKey
        );

        // Step 2: Discover publicly listed business emails from business websites in parallel
        const enrichedProspects = await enrichProspectsWithPublicEmails(rawProspects, 15);

        // Filter by hasEmailOnly if requested
        const finalProspects = body.hasEmailOnly
          ? enrichedProspects.filter((p) => p.contact.hasVerifiedEmail)
          : enrichedProspects;

        const response: SearchResponse = {
          query: body,
          totalFound: finalProspects.length,
          prospects: finalProspects,
          searchTimestamp: new Date().toISOString(),
          isMockData: false,
        };

        return NextResponse.json(response);
      } catch (googleError: unknown) {
        const errorMessage =
          googleError instanceof Error
            ? googleError.message
            : "An unexpected error occurred during Google Places discovery";

        console.error("Google Places discovery execution error:", googleError);

        return NextResponse.json(
          {
            error: "Failed to fetch business prospects from Google Places API",
            details: errorMessage,
            isMockData: false,
          },
          { status: 502 }
        );
      }
    }

    // Development Mock Mode (when ENABLE_REAL_APIS !== "true")
    const mockProspects = queryMockProspects(
      body.productCategory,
      body.targetMarket,
      body.businessType,
      body.hasEmailOnly
    );

    const response: SearchResponse = {
      query: body,
      totalFound: mockProspects.length,
      prospects: mockProspects,
      searchTimestamp: new Date().toISOString(),
      isMockData: IS_DEVELOPMENT_MOCK,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing business discovery search:", error);
    return NextResponse.json(
      { error: "Failed to execute business discovery search" },
      { status: 500 }
    );
  }
}
