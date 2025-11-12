/**
 * Places Enrichment API Route
 * Enriches location data with Google Places API information
 */

import { NextRequest, NextResponse } from "next/server";
import type { LocationSuggestion } from "@/types/location";
import { LocationSuggestionSchema } from "@/types/location";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locations } = body;

    if (!Array.isArray(locations)) {
      return NextResponse.json(
        { error: "Locations must be an array" },
        { status: 400 }
      );
    }

    // Validate locations
    const validatedLocations = locations.map((loc) => {
      const result = LocationSuggestionSchema.safeParse(loc);
      if (!result.success) {
        throw new Error(`Invalid location data: ${result.error.message}`);
      }
      return result.data;
    });

    // TODO: Implement actual Google Places API enrichment
    // For now, return locations as-is
    // In a real implementation, you would:
    // 1. Use Google Places API Nearby Search to find place_id
    // 2. Use Google Places API Place Details to get enriched data
    // 3. Merge the enriched data with the location

    const enrichedLocations: LocationSuggestion[] = validatedLocations;

    return NextResponse.json({
      locations: enrichedLocations,
    });
  } catch (error) {
    console.error("Places enrichment error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unexpected error occurred",
        code: "ENRICHMENT_ERROR",
      },
      { status: 500 }
    );
  }
}
