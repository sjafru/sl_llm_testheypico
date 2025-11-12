/**
 * Query Analyzer
 * Analyzes user queries to detect location context and query type
 */

import { QueryType } from "@/types/llm";

export interface QueryAnalysis {
  type: QueryType;
  hasLocationContext: boolean;
  locationKeywords: string[];
  intentKeywords: string[];
}

export class QueryAnalyzer {
  // Keywords that indicate a location-finding intent
  private static readonly INTENT_KEYWORDS = [
    "find",
    "search",
    "show",
    "locate",
    "where",
    "looking for",
    "near",
    "nearby",
    "around",
    "in",
    "get directions",
    "how to get",
    "navigate",
    "route to",
  ];

  // Common location indicators
  private static readonly LOCATION_INDICATORS = [
    // City names (just examples, real implementation might use geocoding)
    "seattle",
    "portland",
    "san francisco",
    "new york",
    "los angeles",
    "chicago",
    "boston",
    "denver",
    "austin",
    "miami",
    // Location types
    "downtown",
    "neighborhood",
    "area",
    "district",
    "zip",
    "zipcode",
    // Proximity
    "near me",
    "nearby",
    "close",
    "within",
  ];

  // Place/business keywords
  private static readonly PLACE_KEYWORDS = [
    "restaurant",
    "cafe",
    "coffee",
    "shop",
    "store",
    "mall",
    "market",
    "grocery",
    "park",
    "hotel",
    "gym",
    "hospital",
    "pharmacy",
    "bank",
    "gas station",
    "bar",
    "pub",
    "museum",
    "theater",
    "cinema",
  ];

  /**
   * Analyze a user query to determine its type and location context
   */
  static analyze(query: string): QueryAnalysis {
    const lowerQuery = query.toLowerCase();

    // Find matching keywords
    const intentKeywords = this.findMatchingKeywords(
      lowerQuery,
      this.INTENT_KEYWORDS
    );
    const locationKeywords = this.findMatchingKeywords(
      lowerQuery,
      this.LOCATION_INDICATORS
    );
    const placeKeywords = this.findMatchingKeywords(
      lowerQuery,
      this.PLACE_KEYWORDS
    );

    // Determine if query has location context
    const hasLocationContext =
      locationKeywords.length > 0 ||
      lowerQuery.includes("in ") ||
      lowerQuery.includes("near ") ||
      lowerQuery.includes("at ");

    // Determine query type
    const isPlaceQuery =
      intentKeywords.length > 0 || placeKeywords.length > 0;

    return {
      type: isPlaceQuery ? QueryType.FIND_PLACES : QueryType.GENERAL,
      hasLocationContext,
      locationKeywords,
      intentKeywords: [...intentKeywords, ...placeKeywords],
    };
  }

  /**
   * Check if a query needs location clarification
   */
  static needsLocationClarification(query: string): boolean {
    const analysis = this.analyze(query);
    return analysis.type === QueryType.FIND_PLACES && !analysis.hasLocationContext;
  }

  /**
   * Generate a clarification prompt for ambiguous queries
   */
  static generateClarificationPrompt(query: string): string {
    return `To help you find "${query}", could you please specify a location? For example: "${query} in Seattle" or "${query} near downtown".`;
  }

  /**
   * Find matching keywords in a query
   */
  private static findMatchingKeywords(
    query: string,
    keywords: string[]
  ): string[] {
    return keywords.filter((keyword) => query.includes(keyword.toLowerCase()));
  }
}
