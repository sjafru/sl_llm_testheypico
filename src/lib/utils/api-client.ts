/**
 * HTTP Client Utility
 * Provides a centralized client for making API requests with error handling
 */

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export interface APIClientConfig {
  timeout?: number;
  headers?: Record<string, string>;
}

export class APIClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(baseUrl: string = "", config: APIClientConfig = {}) {
    this.baseUrl = baseUrl;
    this.timeout = config.timeout || 30000;
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = this.baseUrl + endpoint;
      const response = await fetch(url, {
        method: "POST",
        headers: { ...this.headers, ...options.headers },
        body: JSON.stringify(data),
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: any = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          console.error("Non-JSON error response:", errorText);
        }

        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("API Error Response (POST):", { url, status: response.status, errorText, errorData });

        throw new APIError(
          errorMessage,
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new APIError("Request timeout", 408, "TIMEOUT");
        }
        throw new APIError(error.message, 500, "UNKNOWN_ERROR");
      }

      throw new APIError("An unknown error occurred", 500, "UNKNOWN_ERROR");
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = this.baseUrl + endpoint;
      const response = await fetch(url, {
        method: "GET",
        headers: { ...this.headers, ...options.headers },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new APIError("Request timeout", 408, "TIMEOUT");
        }
        throw new APIError(error.message, 500, "UNKNOWN_ERROR");
      }

      throw new APIError("An unknown error occurred", 500, "UNKNOWN_ERROR");
    }
  }
}
