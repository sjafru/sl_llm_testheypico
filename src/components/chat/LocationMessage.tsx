"use client";

/**
 * LocationMessage Component
 * Renders location results within a chat message
 */

import React from "react";
import type { LocationSuggestion } from "@/types/location";
import { MapPin } from "lucide-react";

interface LocationMessageProps {
  content: string;
  locations: LocationSuggestion[];
}

export function LocationMessage({ content, locations }: LocationMessageProps) {
  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap">{content}</p>
      {locations.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <p className="text-sm font-semibold mb-2 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Found {locations.length} {locations.length === 1 ? "place" : "places"}:
          </p>
          <ul className="space-y-1 text-sm">
            {locations.map((location, index) => (
              <li key={location.id} className="flex items-start gap-2">
                <span className="font-medium">{index + 1}.</span>
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-xs opacity-80">{location.address}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
