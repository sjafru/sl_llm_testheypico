"use client";

/**
 * MapMarker Component
 * Individual marker on the map with info window
 */

import React, { useState } from "react";
import { Marker, InfoWindow } from "@react-google-maps/api";
import { useMapContext } from "@/lib/contexts/map-context";
import type { LocationSuggestion } from "@/types/location";
import { Star, MapPin, Phone, Globe } from "lucide-react";

interface MapMarkerProps {
  location: LocationSuggestion;
}

export function MapMarker({ location }: MapMarkerProps) {
  const [showInfo, setShowInfo] = useState(false);
  const { setSelectedLocation } = useMapContext();

  const handleClick = () => {
    setShowInfo(true);
    setSelectedLocation(location);
  };

  const handleClose = () => {
    setShowInfo(false);
    setSelectedLocation(null);
  };

  return (
    <>
      <Marker
        position={location.coordinates}
        onClick={handleClick}
        title={location.name}
      />
      {showInfo && (
        <InfoWindow position={location.coordinates} onCloseClick={handleClose}>
          <div className="p-2 max-w-xs">
            <h3 className="font-semibold text-lg mb-1">{location.name}</h3>
            <div className="flex items-start gap-1 text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{location.address}</p>
            </div>

            {location.description && (
              <p className="text-sm text-gray-700 mb-2">{location.description}</p>
            )}

            {location.enrichedData && (
              <div className="space-y-1 border-t pt-2 mt-2">
                {location.enrichedData.rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">
                      {location.enrichedData.rating.toFixed(1)}
                    </span>
                    {location.enrichedData.userRatingsTotal && (
                      <span className="text-gray-500">
                        ({location.enrichedData.userRatingsTotal} reviews)
                      </span>
                    )}
                  </div>
                )}

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
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{location.enrichedData.phoneNumber}</span>
                  </div>
                )}

                {location.enrichedData.website && (
                  <div className="flex items-center gap-1 text-sm">
                    <Globe className="h-3 w-3" />
                    <a
                      href={location.enrichedData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}
