# Quick Start Guide: LLM Maps Integration

**Feature**: 001-llm-maps-integration
**Last Updated**: 2025-11-12

This guide will help you set up and run the Local LLM with Google Maps Integration application.

---

## Prerequisites

### Required Software

1. **Node.js 18+** and pnpm
   ```bash
   # Check version
   node --version  # Should be 18.0.0 or higher
   pnpm --version

   # Install pnpm if not already installed
   npm install -g pnpm
   ```

2. **Local LLM Provider** (choose one):

   **Option A: Ollama** (recommended)
   ```bash
   # macOS/Linux
   curl -fsSL https://ollama.com/install.sh | sh

   # Or download from: https://ollama.com/download
   ```

   **Option B: LM Studio**
   - Download from: https://lmstudio.ai
   - Install and run the application

3. **Git** (for cloning the repository)

### System Requirements

- **RAM**: 8GB minimum (16GB recommended for larger LLM models)
- **Disk Space**: 10GB minimum (for LLM models)
- **CPU**: 4 cores minimum
- **OS**: macOS, Linux, or Windows with WSL2

---

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
4. Create credentials → API Key
5. (Optional) Restrict API key to localhost for security:
   - HTTP referrers: `http://localhost:3000/*`

**Free Tier Limits** (sufficient for development/personal use):
- Maps: 28,000 loads/month
- Places: $200 credit/month (~140,000 requests)
- Directions: $200 credit/month (~40,000 requests)

---

## Step 2: Set Up Local LLM

### Option A: Using Ollama

1. Start Ollama service:
   ```bash
   ollama serve
   ```

2. Pull a recommended model (choose one):
   ```bash
   # Lightweight (4GB RAM)
   ollama pull llama2:7b

   # Better quality (8GB RAM)
   ollama pull mistral:7b

   # Larger model (16GB RAM)
   ollama pull llama2:13b
   ```

3. Test the model:
   ```bash
   ollama run llama2:7b "Hello, tell me about Seattle"
   ```

4. Verify Ollama API is accessible:
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Option B: Using LM Studio

1. Open LM Studio application
2. Go to "Discover" tab
3. Download a model:
   - **Recommended**: `TheBloke/Mistral-7B-Instruct-v0.2-GGUF`
   - Or: `TheBloke/Llama-2-7B-Chat-GGUF`
4. Go to "Local Server" tab
5. Select your downloaded model
6. Click "Start Server"
7. Note the port (default: 1234)

---

## Step 3: Clone and Install

1. Clone the repository (or navigate to project root):
   ```bash
   cd /path/to/adellm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Install shadcn/ui components (if not already done):
   ```bash
   pnpm dlx shadcn-ui@latest init
   ```

---

## Step 4: Configure Environment

1. Create `.env.local` file in project root:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your settings:
   ```env
   # Google Maps Configuration
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

   # LLM Configuration
   LLM_PROVIDER=ollama          # or "lmstudio"
   LLM_BASE_URL=http://localhost:11434  # or http://localhost:1234 for LM Studio
   LLM_MODEL=llama2:7b          # or your chosen model name
   LLM_TIMEOUT=30000            # 30 seconds timeout

   # Application Configuration
   MAX_LOCATIONS_PER_QUERY=10
   ENABLE_REQUEST_LOGGING=true
   ```

3. Create `.env.example` template for other developers:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   LLM_PROVIDER=ollama
   LLM_BASE_URL=http://localhost:11434
   LLM_MODEL=llama2:7b
   LLM_TIMEOUT=30000
   MAX_LOCATIONS_PER_QUERY=10
   ENABLE_REQUEST_LOGGING=true
   ```

---

## Step 5: Run the Application

1. Start the Next.js development server:
   ```bash
   pnpm dev
   ```

2. Open your browser to: http://localhost:3000

3. You should see the chat interface

---

## Step 6: Test the Setup

### Basic Query Test

1. In the chat interface, type: **"Find coffee shops in Seattle"**
2. Press Enter or click Send
3. Wait 3-5 seconds for response
4. You should see:
   - LLM response with location suggestions
   - Google Map with markers for locations
   - Location cards with details

### Directions Test

1. Click on any location marker or card
2. Click "Get Directions" button
3. Allow location access when prompted (or enter a starting address)
4. You should see:
   - Route displayed on embedded map
   - Distance and duration information
   - "Open in Google Maps" link

### Health Check

Verify all services are running:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-12T10:30:00Z",
  "services": {
    "llm": {
      "status": "up",
      "provider": "ollama",
      "model": "llama2:7b",
      "responseTime": 120
    },
    "googleMaps": {
      "status": "up",
      "apiKeyValid": true
    }
  }
}
```

---

## Troubleshooting

### LLM Not Responding

**Problem**: "LLM service unavailable" error

**Solutions**:
1. Check if Ollama/LM Studio is running:
   ```bash
   # For Ollama
   ps aux | grep ollama

   # Or test API directly
   curl http://localhost:11434/api/tags
   ```

2. Verify `LLM_BASE_URL` in `.env.local` matches your LLM service port

3. Check LLM service logs for errors

4. Try restarting the LLM service:
   ```bash
   # Ollama
   ollama serve

   # LM Studio - restart the application
   ```

### Google Maps Not Loading

**Problem**: Map shows error or doesn't load

**Solutions**:
1. Verify API key is correct in `.env.local`
2. Check that APIs are enabled in Google Cloud Console:
   - Maps JavaScript API
   - Places API
   - Directions API
3. Check browser console for API errors
4. Verify API key restrictions (if any) allow localhost:3000

### Slow LLM Responses

**Problem**: LLM takes >10 seconds to respond

**Solutions**:
1. Use a smaller model:
   ```bash
   ollama pull llama2:7b  # Instead of 13b or 70b
   ```

2. Check system resources (RAM/CPU usage)

3. Increase timeout in `.env.local`:
   ```env
   LLM_TIMEOUT=60000  # 60 seconds
   ```

4. Consider using quantized models (GGUF format) for better performance

### No Location Results

**Problem**: LLM responds but returns empty location array

**Solutions**:
1. Make your query more specific:
   - Bad: "find restaurants"
   - Good: "find Italian restaurants in downtown Seattle"

2. Check LLM model quality - some smaller models struggle with structured output

3. Review LLM logs to see the actual response format

### Places API Enrichment Fails

**Problem**: Locations show but without ratings, hours, etc.

**Solutions**:
1. Verify Places API is enabled in Google Cloud Console
2. Check API quota/billing in Google Cloud Console
3. Review browser console for Places API errors
4. Application should gracefully handle this - you'll see basic location info from LLM only

---

## Development Commands

### Run Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
pnpm start
```

### Run Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test with coverage
pnpm test:coverage
```

### Lint Code
```bash
pnpm lint
pnpm lint:fix
```

### Type Check
```bash
pnpm type-check
```

---

## Project Structure Overview

```
.
├── src/                     # Source code directory (EXISTING)
│   ├── app/                 # Next.js App Router (EXISTING)
│   │   ├── api/             # API routes (TO BE ADDED)
│   │   │   ├── llm/
│   │   │   ├── places/
│   │   │   └── health/
│   │   ├── page.tsx         # Main chat interface (EXISTING - to update)
│   │   ├── layout.tsx       # Root layout (EXISTING - to update)
│   │   └── globals.css      # Global styles (EXISTING)
│   ├── components/          # React components (TO BE ADDED)
│   │   ├── chat/            # Chat UI components
│   │   ├── map/             # Map components
│   │   ├── locations/       # Location display
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Business logic (TO BE ADDED)
│   │   ├── llm/             # LLM client code
│   │   ├── maps/            # Google Maps utilities
│   │   └── parsers/         # Response parsers
│   └── types/               # TypeScript types (TO BE ADDED)
├── public/                  # Static assets (EXISTING)
├── specs/                   # Feature specifications
│   └── 001-llm-maps-integration/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       └── quickstart.md (this file)
├── package.json             # Dependencies (EXISTING)
├── tsconfig.json            # TypeScript config (EXISTING)
└── next.config.ts           # Next.js config (EXISTING)
```

**Note**: The project uses Next.js with the `src/` directory structure. All application code will be under `src/`.

---

## Next Steps

1. **Read the Feature Spec**: See `specs/001-llm-maps-integration/spec.md` for full feature requirements

2. **Review API Contracts**: See `specs/001-llm-maps-integration/contracts/api-spec.yaml`

3. **Understand Data Model**: See `specs/001-llm-maps-integration/data-model.md`

4. **Run Tests**: Ensure all tests pass before making changes

5. **Start Development**: Follow the implementation tasks in `tasks.md` (generated by `/speckit.tasks`)

---

## Additional Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Ollama Docs](https://ollama.com/docs)
- [Google Maps API Docs](https://developers.google.com/maps/documentation)
- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)

### LLM Models
- [Ollama Model Library](https://ollama.com/library)
- [LM Studio Models](https://lmstudio.ai/models)
- [Hugging Face Models](https://huggingface.co/models)

### Getting Help
- Check existing GitHub issues
- Create new issue with:
  - Environment details (OS, Node version, LLM provider)
  - Error messages
  - Steps to reproduce
  - `npm run health-check` output

---

## Security Notes

### API Key Security
- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore`
- Use API key restrictions in Google Cloud Console
- Rotate API keys regularly

### Local LLM Security
- LLM runs locally - no data sent to external services
- Google Maps API calls do send location data to Google
- Consider using VPN if privacy is a concern

---

## Performance Tips

### For Better LLM Performance:
1. Use quantized models (Q4/Q5) for faster inference
2. Close other memory-intensive applications
3. Use SSD storage for model files
4. Enable GPU acceleration if available (Ollama/LM Studio)

### For Better Map Performance:
1. Limit to 10 locations per query (already enforced)
2. Use marker clustering for many locations
3. Lazy load maps on scroll
4. Cache Places API responses (session-only)

---

## License & Attribution

- **LLM Models**: Check individual model licenses (often Apache 2.0, MIT)
- **Google Maps**: Subject to [Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms)
- **shadcn/ui**: MIT License
- **Next.js**: MIT License

---

**Happy Coding!**

For questions or issues, refer to the project documentation or create an issue in the repository.
