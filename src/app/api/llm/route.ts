/**
 * LLM API Route
 * Handles user queries and returns location suggestions from the LLM
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { LLMFactory } from "@/lib/llm/llm-factory";
import { LocationParser } from "@/lib/parsers/location-parser";
import { QueryAnalyzer } from "@/lib/parsers/query-analyzer";
import { APIError } from "@/lib/utils/api-client";

const MAX_LOCATIONS = parseInt(
  process.env.MAX_LOCATIONS_PER_QUERY || "10",
  10
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    // Analyze the query
    const analysis = QueryAnalyzer.analyze(query);

    // Check if query needs location clarification
    if (QueryAnalyzer.needsLocationClarification(query)) {
      return NextResponse.json({
        content: QueryAnalyzer.generateClarificationPrompt(query),
        locations: [],
      });
    }

    // Create LLM client
    const llmClient = LLMFactory.createClient();

    // Build prompt for location queries
    // Note: Some models (like Mistral in LM Studio) don't support system role
    // So we combine the instructions with the user query
    const combinedPrompt = `RESPOND ONLY WITH VALID JSON. NO OTHER TEXT.

User query: "${query}"

Return a JSON object with a "locations" array. Each location must have: name, address, latitude, longitude, description, category, confidence.

Example response format:
{"locations":[{"name":"Cafe Name","address":"Full Address, City","latitude":-6.2088,"longitude":106.8456,"description":"Brief description","category":"cafe","confidence":0.9}]}

Rules:
- Maximum ${MAX_LOCATIONS} locations
- Use real places in Indonesia when possible
- If no locations found, return: {"locations":[]}
- IMPORTANT: Return ONLY the JSON object, nothing else`;

    // Use Google Places Text Search for accurate, real location data
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Call Google Places Text Search API
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    // Log the response for debugging
    console.log("Google Places API response:", {
      status: placesData.status,
      error_message: placesData.error_message,
      results_count: placesData.results?.length || 0,
    });

    if (placesData.status !== "OK") {
      console.error("Google Places API error:", {
        status: placesData.status,
        error_message: placesData.error_message,
        query,
      });

      // Provide helpful error message based on status
      let errorMessage = "I couldn't find any locations matching your query.";
      if (placesData.status === "REQUEST_DENIED") {
        errorMessage = "Google Places API is not enabled. Please enable Places API in Google Cloud Console.";
      } else if (placesData.status === "ZERO_RESULTS") {
        errorMessage = "No results found. Try a different search query.";
      } else if (placesData.status === "OVER_QUERY_LIMIT") {
        errorMessage = "API quota exceeded. Please try again later.";
      }

      return NextResponse.json({
        content: errorMessage,
        locations: [],
      });
    }

    if (!placesData.results || placesData.results.length === 0) {
      return NextResponse.json({
        content: "No locations found. Try being more specific about the place you're looking for.",
        locations: [],
      });
    }

    // Convert Google Places results to LocationSuggestion format
    let locations = placesData.results.slice(0, MAX_LOCATIONS).map((place: any) => ({
      id: randomUUID(),
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      description: place.types?.join(", ") || "Place",
      category: place.types?.[0] || "place",
      dataSource: "google_places" as const,
      enrichedData: {
        placeId: place.place_id,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
        } : undefined,
      },
    }));

    // Enforce maximum locations limit
    if (locations.length > MAX_LOCATIONS) {
      locations = locations.slice(0, MAX_LOCATIONS);
    }

    // Generate response content
    let content = "";
    if (locations.length === 0) {
      content =
        "I couldn't find any locations matching your query. Please try being more specific about the location or type of place you're looking for.";
    } else {
      content = `I found ${locations.length} ${
        locations.length === 1 ? "place" : "places"
      } for you. Check the map to see their locations!`;
    }

    return NextResponse.json({
      content,
      locations,
    });
  } catch (error) {
    console.error("LLM API error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    if (error instanceof APIError) {
      console.error("APIError code:", error.code);
      console.error("APIError statusCode:", error.statusCode);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    );
  }
}
