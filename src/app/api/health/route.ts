/**
 * Health Check API Route
 * Verifies connectivity to LLM and Google Maps services
 */

import { NextResponse } from "next/server";
import { LLMFactory } from "@/lib/llm/llm-factory";

export async function GET() {
  try {
    const llmClient = LLMFactory.createClient();
    const llmConfig = LLMFactory.getConfig();
    const startTime = Date.now();

    // Check LLM service health
    let llmStatus = "up";
    let llmResponseTime = 0;

    try {
      const isHealthy = await llmClient.healthCheck();
      llmResponseTime = Date.now() - startTime;
      llmStatus = isHealthy ? "up" : "down";
    } catch (error) {
      llmStatus = "down";
      console.error("LLM health check failed:", error);
    }

    // Check Google Maps API key
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const googleMapsStatus = googleMapsApiKey ? "up" : "down";
    const apiKeyValid = !!googleMapsApiKey && googleMapsApiKey.length > 0;

    const overallStatus =
      llmStatus === "up" && googleMapsStatus === "up" ? "healthy" : "degraded";

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        llm: {
          status: llmStatus,
          provider: llmConfig.provider,
          model: llmConfig.model,
          responseTime: llmResponseTime,
        },
        googleMaps: {
          status: googleMapsStatus,
          apiKeyValid,
        },
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
