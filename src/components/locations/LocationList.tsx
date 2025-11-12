"use client";

/**
 * LocationList Component
 * Renders a grid of LocationCard components
 */

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationCard } from "./LocationCard";
import { useMapContext } from "@/lib/contexts/map-context";
import type { LocationSuggestion } from "@/types/location";

export function LocationList() {
  const { locations, setSelectedLocation, setViewport } = useMapContext();

  const handleSelectLocation = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setViewport({
      center: location.coordinates,
      zoom: 15,
    });
  };

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No locations to display</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-1">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onSelect={handleSelectLocation}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
