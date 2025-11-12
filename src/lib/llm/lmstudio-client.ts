/**
 * LM Studio LLM Client
 * Handles communication with LM Studio local LLM service
 */

import { APIClient, APIError } from "../utils/api-client";
import type { LLMConfig, LLMResponse } from "@/types/llm";

export interface LMStudioChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LMStudioChatRequest {
  model: string;
  messages: LMStudioChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LMStudioChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LMStudioClient {
  private client: APIClient;
  private model: string;

  constructor(config: LLMConfig) {
    this.client = new APIClient(config.baseUrl, {
      timeout: config.timeout,
    });
    this.model = config.model;
  }

  /**
   * Send a chat completion request to LM Studio (OpenAI-compatible API)
   */
  async chatCompletion(
    messages: LMStudioChatMessage[],
    options?: { format?: string; temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    try {
      const request: LMStudioChatRequest = {
        model: this.model,
        messages,
        stream: false,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      };

      const response = await this.client.post<LMStudioChatResponse>(
        "/v1/chat/completions",
        request
      );

      if (!response.choices || response.choices.length === 0) {
        throw new APIError(
          "No response from LM Studio",
          500,
          "LLM_UNAVAILABLE"
        );
      }

      return {
        content: response.choices[0].message.content,
      };
    } catch (error) {
      console.error("LMStudioClient error:", error);
      if (error instanceof APIError) {
        // Pass through the original error message for better debugging
        throw new APIError(
          `LM Studio error: ${error.message}`,
          error.statusCode,
          "LLM_UNAVAILABLE"
        );
      }
      throw error;
    }
  }

  /**
   * Check if LM Studio service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/v1/models");
      return true;
    } catch {
      return false;
    }
  }
}
