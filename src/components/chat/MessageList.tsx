"use client";

/**
 * MessageList Component
 * Displays chat message history with auto-scroll
 */

import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/types/llm";
import { MessageRole, MessageType } from "@/types/llm";
import { LocationMessage } from "./LocationMessage";
import { useChatContext } from "@/lib/contexts/chat-context";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isLoading } = useChatContext();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Ask me to find places near you!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {isLoading && <LoadingSkeleton />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

function MessageItem({ message }: { message: ChatMessage }) {
  const isUser = message.role === MessageRole.USER;
  const isError = message.type === MessageType.ERROR;

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} ${
        isError ? "items-start" : ""
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : isError
            ? "bg-destructive/10 text-destructive border border-destructive/20"
            : "bg-muted"
        }`}
      >
        {message.type === MessageType.LOCATION_RESULTS && message.locations ? (
          <LocationMessage content={message.content} locations={message.locations} />
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        <time className="text-xs opacity-70 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </time>
      </div>
    </div>
  );
}
