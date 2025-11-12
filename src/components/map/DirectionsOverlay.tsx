"use client";

/**
 * DirectionsOverlay Component
 * Displays route information and polyline on the map
 */

import React from "react";
import { DirectionsRenderer } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Navigation, X } from "lucide-react";
import { useMapContext } from "@/lib/contexts/map-context";

export function DirectionsOverlay() {
  const { directionsResponse, setDirectionsResponse } = useMapContext();

  if (!directionsResponse) return null;

  const handleClose = () => {
    setDirectionsResponse(null);
  };

  const handleOpenInMaps = () => {
    if (directionsResponse.googleMapsUrl) {
      window.open(directionsResponse.googleMapsUrl, "_blank");
    }
  };

  return (
    <>
      {/* Info card overlay */}
      <div className="absolute top-4 right-4 z-10 w-80">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Directions
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{directionsResponse.distance.text}</p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{directionsResponse.duration.text}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>

            {directionsResponse.steps && directionsResponse.steps.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2">Route Steps:</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {directionsResponse.steps.slice(0, 5).map((step, index) => (
                    <div key={index} className="text-xs">
                      <p className="font-medium">
                        {index + 1}. {step.instruction}
                      </p>
                      <p className="text-muted-foreground">
                        {step.distance.text} • {step.duration.text}
                      </p>
                    </div>
                  ))}
                  {directionsResponse.steps.length > 5 && (
                    <p className="text-xs text-muted-foreground italic">
                      + {directionsResponse.steps.length - 5} more steps
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button onClick={handleOpenInMaps} className="w-full" variant="default">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
