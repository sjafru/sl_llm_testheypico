/**
 * Google Maps Utilities
 * Helper functions for working with Google Maps
 */

import type { Coordinates, LocationSuggestion } from "@/types/location";
import type { MapBounds, MapViewport } from "@/types/map";

export class GoogleMapsUtils {
  /**
   * Calculate bounds that fit all locations
   */
  static calculateBounds(locations: LocationSuggestion[]): MapBounds | null {
    if (locations.length === 0) return null;

    let north = -90;
    let south = 90;
    let east = -180;
    let west = 180;

    locations.forEach((location) => {
      const { lat, lng } = location.coordinates;
      north = Math.max(north, lat);
      south = Math.min(south, lat);
      east = Math.max(east, lng);
      west = Math.min(west, lng);
    });

    return { north, south, east, west };
  }

  /**
   * Calculate center point from multiple locations
   */
  static calculateCenter(locations: LocationSuggestion[]): Coordinates | null {
    if (locations.length === 0) return null;

    const sum = locations.reduce(
      (acc, location) => ({
        lat: acc.lat + location.coordinates.lat,
        lng: acc.lng + location.coordinates.lng,
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: sum.lat / locations.length,
      lng: sum.lng / locations.length,
    };
  }

  /**
   * Calculate appropriate zoom level based on bounds
   * This is a rough estimation - actual implementation should consider viewport size
   */
  static calculateZoom(bounds: MapBounds): number {
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    const maxDiff = Math.max(latDiff, lngDiff);

    // Calculate base zoom
    let zoom: number;
    if (maxDiff >= 180) zoom = 2;
    else if (maxDiff >= 90) zoom = 3;
    else if (maxDiff >= 45) zoom = 4;
    else if (maxDiff >= 22) zoom = 5;
    else if (maxDiff >= 11) zoom = 6;
    else if (maxDiff >= 5) zoom = 7;
    else if (maxDiff >= 2.5) zoom = 8;
    else if (maxDiff >= 1) zoom = 9;
    else if (maxDiff >= 0.5) zoom = 10;
    else if (maxDiff >= 0.25) zoom = 11;
    else if (maxDiff >= 0.125) zoom = 12;
    else if (maxDiff >= 0.06) zoom = 13;
    else if (maxDiff >= 0.03) zoom = 14;
    else zoom = 15;

    // For very small areas (all results in same city), use a reasonable city zoom
    // Instead of zooming in too close, show the whole city area
    if (zoom >= 14) {
      return 12; // City-wide view
    }

    return zoom;
  }

  /**
   * Calculate viewport that fits all locations
   */
  static calculateViewport(
    locations: LocationSuggestion[]
  ): MapViewport | null {
    const center = this.calculateCenter(locations);
    if (!center) return null;

    const bounds = this.calculateBounds(locations);
    if (!bounds) return null;

    const zoom = this.calculateZoom(bounds);

    return { center, zoom };
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   * Using Haversine formula
   */
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) *
        Math.cos(this.toRadians(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Format distance for display
   */
  static formatDistance(kilometers: number): string {
    if (kilometers < 1) {
      return `${Math.round(kilometers * 1000)}m`;
    }
    return `${kilometers.toFixed(1)}km`;
  }

  /**
   * Generate static map image URL
   * Useful for fallback or previews
   */
  static generateStaticMapUrl(
    center: Coordinates,
    zoom: number,
    markers: LocationSuggestion[],
    width: number = 600,
    height: number = 400,
    apiKey: string
  ): string {
    const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
    const params = new URLSearchParams({
      center: `${center.lat},${center.lng}`,
      zoom: zoom.toString(),
      size: `${width}x${height}`,
      key: apiKey,
    });

    // Add markers
    markers.forEach((marker, index) => {
      params.append(
        "markers",
        `label:${String.fromCharCode(65 + index)}|${marker.coordinates.lat},${marker.coordinates.lng}`
      );
    });

    return `${baseUrl}?${params.toString()}`;
  }
}
