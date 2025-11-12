"use client";

/**
 * MapEmbed Component
 * Embedded Google Map with markers using @react-google-maps/api
 */

import React, { useCallback } from "react";
import { GoogleMap, useJsApiLoader, Polyline } from "@react-google-maps/api";
import { useMapContext } from "@/lib/contexts/map-context";
import { MapMarker } from "./MapMarker";
import { DirectionsOverlay } from "./DirectionsOverlay";
import { Card } from "@/components/ui/card";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

export const MapEmbed = React.memo(function MapEmbed() {
  const { viewport, setViewport, locations, directionsResponse } = useMapContext();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback((mapInstance: google.maps.Map) => {
    setMap(null);
  }, []);

  // Decode polyline path for rendering
  const decodedPath = React.useMemo(() => {
    if (!directionsResponse || !directionsResponse.polyline || !isLoaded) return null;

    try {
      return google.maps.geometry.encoding.decodePath(directionsResponse.polyline);
    } catch (error) {
      console.error("Error decoding polyline:", error);
      return null;
    }
  }, [directionsResponse, isLoaded]);

  if (loadError) {
    return (
      <Card className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-destructive font-semibold">Failed to load Google Maps</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check your API key configuration
          </p>
        </div>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="flex items-center justify-center h-full p-4">
        <p className="text-muted-foreground">Loading map...</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full relative" role="region" aria-label="Interactive map showing location results">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={viewport.center}
        zoom={viewport.zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onCenterChanged={() => {
          // Handle center change if needed
        }}
        onZoomChanged={() => {
          // Handle zoom change if needed
        }}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Show location markers when not showing directions */}
        {!directionsResponse && locations.map((location) => (
          <MapMarker key={location.id} location={location} />
        ))}

        {/* Show directions route as polyline */}
        {decodedPath && (
          <Polyline
            path={decodedPath}
            options={{
              strokeColor: "#4285F4",
              strokeWeight: 5,
              strokeOpacity: 0.8,
            }}
          />
        )}
      </GoogleMap>

      {/* Directions info overlay */}
      <DirectionsOverlay />
    </Card>
  );
});
