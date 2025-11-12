import { z } from "zod";
import type { Coordinates } from "./location";

// Types
export interface MapViewport {
  center: Coordinates;
  zoom: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  title: string;
  description?: string;
  icon?: string;
  onClick?: () => void;
}

// Zod Schemas
export const MapViewportSchema = z.object({
  center: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  zoom: z.number().min(1).max(20),
});

export const MapBoundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});
