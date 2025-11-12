"use client";

/**
 * ChatInterface Component
 * Main chat interface integrating MessageInput and MessageList
 */

import React from "react";
import { Card } from "@/components/ui/card";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useMapContext } from "@/lib/contexts/map-context";
import { MessageRole, MessageType } from "@/types/llm";
import { APIClient } from "@/lib/utils/api-client";
import { ErrorHandler } from "@/lib/utils/error-handler";
import type { LocationSuggestion } from "@/types/location";

export function ChatInterface() {
  const { messages, addMessage, isLoading, setIsLoading } = useChatContext();
  const { setLocations, fitToLocations } = useMapContext();

  const handleSubmit = async (message: string) => {
    // Add user message
    addMessage({
      role: MessageRole.USER,
      content: message,
      type: MessageType.TEXT,
    });

    setIsLoading(true);

    try {
      // Call LLM API
      const client = new APIClient();
      const response = await client.post<{
        content: string;
        locations?: LocationSuggestion[];
      }>("/api/llm", { query: message });

      // Add assistant message with locations
      addMessage({
        role: MessageRole.ASSISTANT,
        content: response.content,
        type: response.locations ? MessageType.LOCATION_RESULTS : MessageType.TEXT,
        locations: response.locations,
      });

      // Update map if locations were returned
      if (response.locations && response.locations.length > 0) {
        setLocations(response.locations);
        fitToLocations(response.locations);
      }
    } catch (error) {
      const friendlyError = ErrorHandler.toUserFriendlyError(error);
      addMessage({
        role: MessageRole.ASSISTANT,
        content: `${friendlyError.title}: ${friendlyError.message}\n\n${friendlyError.suggestion || ""}`,
        type: MessageType.ERROR,
      });
      console.error("Chat error:", ErrorHandler.formatForLogging(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full p-4">
      <div className="flex-1 mb-4 overflow-hidden">
        <MessageList messages={messages} />
      </div>
      <MessageInput
        onSubmit={handleSubmit}
        disabled={isLoading}
        placeholder={
          isLoading
            ? "Thinking..."
            : "Ask me to find places... (e.g., 'Find coffee shops in Seattle')"
        }
      />
    </Card>
  );
}
