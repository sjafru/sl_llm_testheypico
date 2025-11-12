/**
 * LLM Factory
 * Creates the appropriate LLM client based on environment configuration
 */

import { OllamaClient } from "./ollama-client";
import { LMStudioClient } from "./lmstudio-client";
import type { LLMConfig } from "@/types/llm";

export type LLMClient = OllamaClient | LMStudioClient;

export class LLMFactory {
  /**
   * Create an LLM client based on environment configuration
   */
  static createClient(): LLMClient {
    const provider = process.env.LLM_PROVIDER || "ollama";
    const baseUrl = process.env.LLM_BASE_URL || "http://localhost:11434";
    const model = process.env.LLM_MODEL || "mistral:7b";
    const timeout = parseInt(process.env.LLM_TIMEOUT || "30000", 10);

    const config: LLMConfig = {
      provider: provider as "ollama" | "lmstudio",
      baseUrl,
      model,
      timeout,
    };

    switch (provider) {
      case "ollama":
        return new OllamaClient(config);
      case "lmstudio":
        return new LMStudioClient(config);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  /**
   * Get current LLM configuration from environment
   */
  static getConfig(): LLMConfig {
    return {
      provider: (process.env.LLM_PROVIDER || "ollama") as "ollama" | "lmstudio",
      baseUrl: process.env.LLM_BASE_URL || "http://localhost:11434",
      model: process.env.LLM_MODEL || "mistral:7b",
      timeout: parseInt(process.env.LLM_TIMEOUT || "30000", 10),
    };
  }
}
