import { z } from "zod";

// Enums
export enum DataSource {
  LLM = "llm",
  GOOGLE_PLACES = "google_places",
  HYBRID = "hybrid",
}

// Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlacesEnrichedData {
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  photos?: {
    photoReference: string;
    width: number;
    height: number;
  }[];
  website?: string;
  phoneNumber?: string;
  businessStatus?: string;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  description?: string;
  category?: string;
  dataSource: DataSource;
  enrichedData?: PlacesEnrichedData;
  confidence?: number;
}

export interface DirectionsRequest {
  origin: Coordinates;
  destination: Coordinates;
  travelMode?: "DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT";
}

export interface DirectionsResponse {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  steps: {
    instruction: string;
    distance: { text: string; value: number };
    duration: { text: string; value: number };
  }[];
  googleMapsUrl: string;
}

// Zod Schemas
export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const PlacesEnrichedDataSchema = z.object({
  placeId: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  userRatingsTotal: z.number().min(0).optional(),
  priceLevel: z.number().min(0).max(4).optional(),
  openingHours: z.object({
    openNow: z.boolean().optional(),
    weekdayText: z.array(z.string()).optional(),
  }).optional(),
  photos: z.array(z.object({
    photoReference: z.string(),
    width: z.number(),
    height: z.number(),
  })).optional(),
  website: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  businessStatus: z.string().optional(),
});

export const LocationSuggestionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().min(1),
  coordinates: CoordinatesSchema,
  description: z.string().optional(),
  category: z.string().optional(),
  dataSource: z.nativeEnum(DataSource),
  enrichedData: PlacesEnrichedDataSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const DirectionsRequestSchema = z.object({
  origin: CoordinatesSchema,
  destination: CoordinatesSchema,
  travelMode: z.enum(["DRIVING", "WALKING", "BICYCLING", "TRANSIT"]).optional(),
});
