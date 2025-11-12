"use client";

/**
 * LocationMessage Component
 * Renders location results within a chat message
 */

import React from "react";
import type { LocationSuggestion } from "@/types/location";
import { LocationCard } from "@/components/locations/LocationCard";

interface LocationMessageProps {
  content: string;
  locations: LocationSuggestion[];
}

export function LocationMessage({ content, locations }: LocationMessageProps) {
  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap text-sm">{content}</p>
      {locations.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      )}
    </div>
  );
}
