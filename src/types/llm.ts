import { z } from "zod";

// Enums
export enum QueryType {
  FIND_PLACES = "find_places",
  GENERAL = "general",
}

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum MessageType {
  TEXT = "text",
  LOCATION_RESULTS = "location_results",
  ERROR = "error",
}

// Types
export interface UserQuery {
  text: string;
  type: QueryType;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  timestamp: string;
  locations?: import("./location").LocationSuggestion[];
}

export interface LLMConfig {
  provider: "ollama" | "lmstudio";
  baseUrl: string;
  model: string;
  timeout: number;
}

export interface LLMResponse {
  content: string;
  locations?: import("./location").LocationSuggestion[];
  error?: string;
}

// Zod Schemas
export const UserQuerySchema = z.object({
  text: z.string().min(1, "Query text cannot be empty").max(500, "Query text too long"),
  type: z.nativeEnum(QueryType),
  timestamp: z.string().datetime(),
});

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  role: z.nativeEnum(MessageRole),
  content: z.string(),
  type: z.nativeEnum(MessageType),
  timestamp: z.string().datetime(),
  locations: z.array(z.any()).optional(), // Will be LocationSuggestionSchema from location.ts
});

export const LLMConfigSchema = z.object({
  provider: z.enum(["ollama", "lmstudio"]),
  baseUrl: z.string().url(),
  model: z.string().min(1),
  timeout: z.number().positive(),
});
