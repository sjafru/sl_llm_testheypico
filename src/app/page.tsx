"use client";

/**
 * Home Page
 * Main application page with chat interface and map
 */

import { ChatInterface } from "@/components/chat/ChatInterface";
import { MapEmbed } from "@/components/map/MapEmbed";

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Local LLM Maps</h1>
        <p className="text-sm text-muted-foreground">
          Find places using your local LLM and Google Maps
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Chat Interface - Left Side */}
        <div className="w-full md:w-1/2 h-full">
          <ChatInterface />
        </div>

        {/* Map - Right Side */}
        <div className="hidden md:block w-1/2 h-full">
          <MapEmbed />
        </div>
      </main>
    </div>
  );
}
