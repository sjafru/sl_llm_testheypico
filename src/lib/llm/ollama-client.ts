/**
 * Ollama LLM Client
 * Handles communication with Ollama local LLM service
 */

import { APIClient, APIError } from "../utils/api-client";
import type { LLMConfig, LLMResponse } from "@/types/llm";

export interface OllamaChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  stream?: boolean;
  format?: "json";
  options?: {
    temperature?: number;
    top_p?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaClient {
  private client: APIClient;
  private model: string;

  constructor(config: LLMConfig) {
    this.client = new APIClient(config.baseUrl, {
      timeout: config.timeout,
    });
    this.model = config.model;
  }

  /**
   * Send a chat completion request to Ollama
   */
  async chatCompletion(
    messages: OllamaChatMessage[],
    options?: { format?: "json"; temperature?: number }
  ): Promise<LLMResponse> {
    try {
      const request: OllamaChatRequest = {
        model: this.model,
        messages,
        stream: false,
        ...(options?.format && { format: options.format }),
        ...(options?.temperature && {
          options: { temperature: options.temperature },
        }),
      };

      const response = await this.client.post<OllamaChatResponse>(
        "/api/chat",
        request
      );

      return {
        content: response.message.content,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw new APIError(
          "Ollama service unavailable",
          error.statusCode,
          "LLM_UNAVAILABLE"
        );
      }
      throw error;
    }
  }

  /**
   * Check if Ollama service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/api/tags");
      return true;
    } catch {
      return false;
    }
  }
}
