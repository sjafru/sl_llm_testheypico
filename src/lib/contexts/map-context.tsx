"use client";

/**
 * Map Context
 * Manages map viewport and locations state across the application
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import type { MapViewport } from "@/types/map";
import type { LocationSuggestion, DirectionsResponse } from "@/types/location";
import { GoogleMapsUtils } from "@/lib/maps/google-maps";

interface MapContextType {
  viewport: MapViewport;
  setViewport: (viewport: MapViewport) => void;
  locations: LocationSuggestion[];
  setLocations: (locations: LocationSuggestion[]) => void;
  selectedLocation: LocationSuggestion | null;
  setSelectedLocation: (location: LocationSuggestion | null) => void;
  fitToLocations: (locations: LocationSuggestion[]) => void;
  directionsResponse: (DirectionsResponse & { polyline?: string }) | null;
  setDirectionsResponse: (response: (DirectionsResponse & { polyline?: string }) | null) => void;
}

// Default viewport (centered on Indonesia)
const DEFAULT_VIEWPORT: MapViewport = {
  center: { lat: -0.7893, lng: 113.9213 },
  zoom: 5,
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [viewport, setViewport] = useState<MapViewport>(DEFAULT_VIEWPORT);
  const [locations, setLocations] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestion | null>(null);
  const [directionsResponse, setDirectionsResponse] =
    useState<(DirectionsResponse & { polyline?: string }) | null>(null);

  const fitToLocations = useCallback((newLocations: LocationSuggestion[]) => {
    if (newLocations.length === 0) {
      setViewport(DEFAULT_VIEWPORT);
      return;
    }

    const calculatedViewport = GoogleMapsUtils.calculateViewport(newLocations);
    if (calculatedViewport) {
      setViewport(calculatedViewport);
    }
  }, []);

  return (
    <MapContext.Provider
      value={{
        viewport,
        setViewport,
        locations,
        setLocations,
        selectedLocation,
        setSelectedLocation,
        fitToLocations,
        directionsResponse,
        setDirectionsResponse,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within MapProvider");
  }
  return context;
}
