"use client";

/**
 * LocationCard Component
 * Displays individual location details in a card format
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LocationSuggestion } from "@/types/location";
import { MapPin, Star, Phone, Globe, ExternalLink, Navigation } from "lucide-react";
import { PlacesService } from "@/lib/maps/places-service";
import { useMapContext } from "@/lib/contexts/map-context";
import { APIClient } from "@/lib/utils/api-client";
import { toast } from "sonner";

interface LocationCardProps {
  location: LocationSuggestion;
  onSelect?: (location: LocationSuggestion) => void;
}

export function LocationCard({ location, onSelect }: LocationCardProps) {
  const { setDirectionsResponse, setViewport } = useMapContext();
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);

  const handleViewOnMap = () => {
    const url = PlacesService.generateMapsUrl(location);
    window.open(url, "_blank");
  };

  const handleGetDirections = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingDirections(true);

    try {
      // Try to get user's current location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const origin = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Call directions API
            const client = new APIClient();
            const response = await client.post<any>("/api/places/directions", {
              origin,
              destination: location.coordinates,
              travelMode: "DRIVING",
            });

            setDirectionsResponse(response);

            // Center map on route
            const midLat = (origin.lat + location.coordinates.lat) / 2;
            const midLng = (origin.lng + location.coordinates.lng) / 2;
            setViewport({ center: { lat: midLat, lng: midLng }, zoom: 12 });

            setIsLoadingDirections(false);
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.error(
              "Unable to get your location. Please enable location permissions in your browser."
            );
            setIsLoadingDirections(false);
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser.");
        setIsLoadingDirections(false);
      }
    } catch (error) {
      console.error("Directions error:", error);
      toast.error("Failed to get directions. Please try again.");
      setIsLoadingDirections(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect?.(location)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-start justify-between gap-2">
          <span>{location.name}</span>
          {location.enrichedData?.rating && (
            <div className="flex items-center gap-1 text-sm font-normal">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{location.enrichedData.rating.toFixed(1)}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>{location.address}</p>
        </div>

        {location.description && (
          <p className="text-sm">{location.description}</p>
        )}

        {location.category && (
          <p className="text-xs text-muted-foreground">
            Category: {location.category}
          </p>
        )}

        {location.enrichedData && (
          <div className="pt-2 border-t space-y-1">
            {location.enrichedData.openingHours?.openNow !== undefined && (
              <p className="text-sm">
                <span
                  className={
                    location.enrichedData.openingHours.openNow
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {location.enrichedData.openingHours.openNow
                    ? "Open now"
                    : "Closed"}
                </span>
              </p>
            )}

            {location.enrichedData.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{location.enrichedData.phoneNumber}</span>
              </div>
            )}

            {location.enrichedData.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-3 w-3" />
                <a
                  href={location.enrichedData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit website
                </a>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetDirections}
            disabled={isLoadingDirections}
          >
            <Navigation className="h-4 w-4 mr-1" />
            {isLoadingDirections ? "Loading..." : "Directions"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewOnMap();
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
