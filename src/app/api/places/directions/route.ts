/**
 * Directions API Route
 * Calculates routes between two points using Google Directions API
 */

import { NextRequest, NextResponse } from "next/server";
import type { DirectionsRequest } from "@/types/location";
import { DirectionsRequestSchema } from "@/types/location";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = DirectionsRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error },
        { status: 400 }
      );
    }

    const { origin, destination, travelMode = "DRIVING" } = validationResult.data;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Call Google Directions API
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: travelMode.toLowerCase(),
      key: apiKey,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Directions API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: `Directions API error: ${data.status}`, details: data.error_message },
        { status: 400 }
      );
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Format response
    const directionsResponse = {
      distance: {
        text: leg.distance.text,
        value: leg.distance.value,
      },
      duration: {
        text: leg.duration.text,
        value: leg.duration.value,
      },
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""), // Strip HTML
        distance: {
          text: step.distance.text,
          value: step.distance.value,
        },
        duration: {
          text: step.duration.text,
          value: step.duration.value,
        },
      })),
      googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=${travelMode.toLowerCase()}`,
      polyline: route.overview_polyline.points,
    };

    return NextResponse.json(directionsResponse);
  } catch (error) {
    console.error("Directions API error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        code: "DIRECTIONS_ERROR",
      },
      { status: 500 }
    );
  }
}
