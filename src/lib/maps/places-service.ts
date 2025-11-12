/**
 * Google Places Service
 * Handles enrichment of location data using Google Places API
 */

import { APIClient, APIError } from "../utils/api-client";
import type {
  LocationSuggestion,
  PlacesEnrichedData,
  Coordinates,
} from "@/types/location";
import { DataSource } from "@/types/location";

export interface PlacesSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  photos?: {
    photo_reference: string;
    width: number;
    height: number;
  }[];
  business_status?: string;
}

export interface PlaceDetailsResult extends PlacesSearchResult {
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

export class PlacesService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Enrich a location suggestion with Google Places data
   * Uses nearby search to find matching place
   */
  async enrichLocation(
    location: LocationSuggestion
  ): Promise<LocationSuggestion> {
    try {
      // Search for the place using coordinates and name
      const placeId = await this.findPlaceId(
        location.name,
        location.coordinates
      );

      if (!placeId) {
        // No matching place found, return original
        return location;
      }

      // Get detailed information about the place
      const details = await this.getPlaceDetails(placeId);

      // Merge enriched data
      const enrichedData: PlacesEnrichedData = {
        placeId: details.place_id,
        rating: details.rating,
        userRatingsTotal: details.user_ratings_total,
        priceLevel: details.price_level,
        openingHours: details.opening_hours
          ? {
              openNow: details.opening_hours.open_now,
              weekdayText: details.opening_hours.weekday_text,
            }
          : undefined,
        photos: details.photos
          ? details.photos.map((photo) => ({
              photoReference: photo.photo_reference,
              width: photo.width,
              height: photo.height,
            }))
          : undefined,
        website: details.website,
        phoneNumber: details.formatted_phone_number,
        businessStatus: details.business_status,
      };

      return {
        ...location,
        dataSource: DataSource.HYBRID,
        enrichedData,
      };
    } catch (error) {
      console.error("Failed to enrich location:", error);
      // Return original location if enrichment fails
      return location;
    }
  }

  /**
   * Find a place ID using text search
   */
  private async findPlaceId(
    name: string,
    coordinates: Coordinates
  ): Promise<string | null> {
    // In a real implementation, this would use the Google Places API
    // For now, we'll implement this via the Next.js API route
    // which will use the server-side Google Maps client
    return null;
  }

  /**
   * Get detailed information about a place
   */
  private async getPlaceDetails(placeId: string): Promise<PlaceDetailsResult> {
    // In a real implementation, this would use the Google Places API
    // For now, we'll implement this via the Next.js API route
    throw new Error("Not implemented - use API route instead");
  }

  /**
   * Generate Google Maps URL for a location
   */
  static generateMapsUrl(location: LocationSuggestion): string {
    const { lat, lng } = location.coordinates;
    const query = encodeURIComponent(location.name);
    return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${location.enrichedData?.placeId || ""}&center=${lat},${lng}`;
  }

  /**
   * Generate Google Maps directions URL
   */
  static generateDirectionsUrl(
    origin: Coordinates,
    destination: Coordinates
  ): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;
  }
}
