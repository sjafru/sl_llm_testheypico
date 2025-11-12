/**
 * Error Handler Utility
 * Maps technical errors to user-friendly messages
 */

import { APIError } from "./api-client";

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  code?: string;
}

export class ErrorHandler {
  /**
   * Convert any error to a user-friendly error object
   */
  static toUserFriendlyError(error: unknown): UserFriendlyError {
    // Handle API errors
    if (error instanceof APIError) {
      return this.handleAPIError(error);
    }

    // Handle standard errors
    if (error instanceof Error) {
      return {
        title: "Something went wrong",
        message: error.message,
        suggestion: "Please try again or contact support if the issue persists.",
      };
    }

    // Handle unknown errors
    return {
      title: "Unknown error",
      message: "An unexpected error occurred.",
      suggestion: "Please try again later.",
    };
  }

  private static handleAPIError(error: APIError): UserFriendlyError {
    switch (error.code) {
      case "TIMEOUT":
        return {
          title: "Request timeout",
          message: "The request took too long to complete.",
          suggestion: "Please check your internet connection and try again.",
          code: error.code,
        };

      case "LLM_UNAVAILABLE":
        return {
          title: "LLM service unavailable",
          message: "The local LLM service is not responding.",
          suggestion: "Please ensure Ollama or LM Studio is running and try again.",
          code: error.code,
        };

      case "GOOGLE_MAPS_API_ERROR":
        return {
          title: "Maps service unavailable",
          message: "Unable to connect to Google Maps service.",
          suggestion: "Please check your API key configuration and try again.",
          code: error.code,
        };

      case "INVALID_QUERY":
        return {
          title: "Invalid query",
          message: error.message,
          suggestion: "Please provide more details about the location you're looking for.",
          code: error.code,
        };

      case "NO_RESULTS":
        return {
          title: "No results found",
          message: "We couldn't find any locations matching your query.",
          suggestion: "Try rephrasing your query or being more specific about the location.",
          code: error.code,
        };

      case "RATE_LIMIT_EXCEEDED":
        return {
          title: "Too many requests",
          message: "You've exceeded the rate limit.",
          suggestion: "Please wait a moment before trying again.",
          code: error.code,
        };

      default:
        return {
          title: "Service error",
          message: error.message,
          suggestion: "Please try again or contact support if the issue persists.",
          code: error.code,
        };
    }
  }

  /**
   * Format error for logging
   */
  static formatForLogging(error: unknown): string {
    if (error instanceof APIError) {
      return `[${error.code || "UNKNOWN"}] ${error.message} (Status: ${error.statusCode})`;
    }

    if (error instanceof Error) {
      return `[ERROR] ${error.name}: ${error.message}\n${error.stack || ""}`;
    }

    return `[UNKNOWN ERROR] ${JSON.stringify(error)}`;
  }
}
