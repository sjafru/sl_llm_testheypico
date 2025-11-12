/**
 * Location Parser
 * Parses LLM JSON responses into LocationSuggestion objects
 */

import { randomUUID } from "crypto";
import { LocationSuggestionSchema, DataSource } from "@/types/location";
import type { LocationSuggestion } from "@/types/location";
import { APIError } from "../utils/api-client";

interface RawLocation {
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  description?: string;
  category?: string;
  confidence?: number;
}

export class LocationParser {
  /**
   * Parse LLM JSON response into LocationSuggestion array
   * Handles various JSON formats the LLM might return
   */
  static parse(jsonString: string): LocationSuggestion[] {
    try {
      const parsed = JSON.parse(jsonString);

      // Handle different response formats
      let rawLocations: RawLocation[] = [];

      if (Array.isArray(parsed)) {
        rawLocations = parsed;
      } else if (parsed.locations && Array.isArray(parsed.locations)) {
        rawLocations = parsed.locations;
      } else if (parsed.results && Array.isArray(parsed.results)) {
        rawLocations = parsed.results;
      } else if (parsed.places && Array.isArray(parsed.places)) {
        rawLocations = parsed.places;
      } else {
        throw new APIError(
          "Invalid LLM response format",
          400,
          "INVALID_LLM_RESPONSE"
        );
      }

      // Convert raw locations to LocationSuggestion objects
      const locations = rawLocations.map((raw) =>
        this.normalizeLocation(raw)
      );

      // Validate with Zod
      const validatedLocations = locations.map((loc) => {
        const result = LocationSuggestionSchema.safeParse(loc);
        if (!result.success) {
          console.warn("Location validation failed:", result.error);
          return null;
        }
        return result.data;
      });

      // Filter out invalid locations
      return validatedLocations.filter(
        (loc): loc is LocationSuggestion => loc !== null
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new APIError(
          "Failed to parse LLM JSON response",
          400,
          "INVALID_JSON"
        );
      }
      throw error;
    }
  }

  /**
   * Normalize a raw location object to LocationSuggestion format
   */
  private static normalizeLocation(raw: RawLocation): LocationSuggestion {
    // Extract coordinates from various possible formats
    let lat: number;
    let lng: number;

    if (raw.coordinates) {
      lat = raw.coordinates.lat;
      lng = raw.coordinates.lng;
    } else if (raw.latitude !== undefined && raw.longitude !== undefined) {
      lat = raw.latitude;
      lng = raw.longitude;
    } else if (raw.lat !== undefined && raw.lng !== undefined) {
      lat = raw.lat;
      lng = raw.lng;
    } else {
      throw new APIError(
        `Missing coordinates for location: ${raw.name}`,
        400,
        "MISSING_COORDINATES"
      );
    }

    return {
      id: randomUUID(),
      name: raw.name,
      address: raw.address,
      coordinates: { lat, lng },
      description: raw.description,
      category: raw.category,
      dataSource: DataSource.LLM,
      confidence: raw.confidence,
    };
  }

  /**
   * Extract location text from LLM response that might be mixed text/JSON
   */
  static extractJSON(llmResponse: string): string {
    // Try to find JSON array or object in the response
    const jsonArrayMatch = llmResponse.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      return jsonArrayMatch[0];
    }

    const jsonObjectMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      return jsonObjectMatch[0];
    }

    // If no JSON found, return as-is (will likely fail parsing)
    return llmResponse;
  }
}
