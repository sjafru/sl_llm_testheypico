/**
 * Google Directions Service
 * Handles route calculation using Google Directions API
 */

import type { DirectionsRequest, DirectionsResponse, Coordinates } from "@/types/location";

export class DirectionsService {
  /**
   * Generate Google Maps directions URL
   */
  static generateDirectionsUrl(origin: Coordinates, destination: Coordinates, travelMode?: string): string {
    const mode = travelMode?.toLowerCase() || "driving";
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=${mode}`;
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Format duration for display
   */
  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }
}
