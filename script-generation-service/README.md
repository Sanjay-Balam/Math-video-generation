# Math Video Generator API

A modern API service for generating Manim Python scripts from mathematical prompts using various LLM providers (OpenRouter/DeepSeek V3, Google Gemini).

## Features

- 🚀 Generate Manim Python scripts from natural language mathematical descriptions
- 🤖 Support for multiple LLM providers (OpenRouter with DeepSeek V3 - FREE, Google Gemini)
- 🔄 Automatic fallback between providers
- ✅ Validate generated scripts for proper Manim structure
- 🧮 Sample prompts for quick testing
- 📚 Clean, well-documented API with Swagger UI
- ⚡ Built with Bun.js and Elysia for high performance
- 🗄️ Vector database integration for context-aware generation

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0+)
- At least one LLM API key:
  - OpenRouter API key (FREE - recommended)
  - Google Gemini API key (paid after free trial)
- Optional: Qdrant vector database for enhanced generation

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd script-generation-service
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your LLM provider:
```bash
# Choose your provider: 'gemini' or 'openrouter'
LLM_PROVIDER=openrouter

# OpenRouter API Key (FREE - Get at https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Google Gemini API Key (Optional)
# GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Qdrant Configuration (Optional)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=optional_api_key
```

## Getting API Keys

### OpenRouter (Recommended - FREE)
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for a free account (no credit card required)
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. You get 50-1000 free requests per day (based on credits)
6. Uses DeepSeek V3 model which excels at code generation

### Google Gemini (Paid after trial)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Note: Free trial expires, then requires payment

## Running the Service

### Development mode:
```bash
bun run dev
```

### Production mode:
```bash
bun run start
```

### Build executable:
```bash
bun run build
```

## API Endpoints

Access the full API documentation at `http://localhost:5000/swagger`

### Core Endpoints

#### Generate Manim Script
```bash
curl -X POST http://localhost:5000/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Visualize the Pythagorean theorem with animated squares",
    "saveToFile": true
  }'
```

#### Test LLM Connection
```bash
curl http://localhost:5000/api/test-llm
```

#### Check Provider Information
```bash
curl http://localhost:5000/api/provider-info
```

#### Get Sample Prompts
```bash
curl http://localhost:5000/api/sample-prompts
```

#### Validate Script
```bash
curl -X POST http://localhost:5000/api/validate-script \
  -H "Content-Type: application/json" \
  -d '{
    "script": "from manim import * ..."
  }'
```

### Enhanced Endpoints (with Vector DB)

#### Generate with Context
```bash
curl -X POST http://localhost:5000/api/generate-script-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a circle animation",
    "useRAG": true
  }'
```

## Configuration

### Environment Variables

- `LLM_PROVIDER`: Choose between 'openrouter' or 'gemini' (default: openrouter)
- `OPENROUTER_API_KEY`: Your OpenRouter API key (free tier available)
- `GEMINI_API_KEY`: Your Google Gemini API key (optional)
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS (optional)
- `VIDEO_SERVICE_URL`: URL of the video generation service (default: http://localhost:8001)

### Provider Selection

The service automatically selects the configured provider. If one provider fails, it will attempt to use the fallback provider if available.

## Example Prompts

- "Visualize the Pythagorean theorem with animated squares on each side of a right triangle"
- "Create an animation showing how sine and cosine waves are generated from a unit circle"
- "Demonstrate the concept of limits by showing a function approaching a value"
- "Show the visual proof of the sum of first n natural numbers using triangular arrangements"
- "Animate the process of finding the derivative of x^2 using the limit definition"

## Troubleshooting

### LLM API Connection Issues
- Verify your API key is correctly set in the `.env` file
- Check if you have remaining credits/quota
- Test the connection with `/api/test-llm` endpoint

### Script Generation Errors
- Ensure your prompt is clear and mathematical in nature
- Check the validation errors returned by the API
- Look at the generated script structure

### Rate Limiting
- OpenRouter free tier: 50-1000 requests/day
- Consider implementing caching or using the vector DB for similar requests

## Development

### Project Structure
```
script-generation-service/
├── src/
│   ├── index.ts           # Main application entry
│   ├── routes/
│   │   └── video.ts       # API route definitions
│   └── services/
│       ├── llmProvider.ts # LLM provider abstraction
│       ├── openrouter.ts  # OpenRouter implementation
│       ├── gemini.ts      # Gemini implementation
│       └── qdrant.ts      # Vector DB service
├── generated_scripts/     # Saved Manim scripts
├── .env.example          # Environment template
├── package.json          # Dependencies
└── README.md            # This file
```

### Adding New Providers

To add a new LLM provider:
1. Create a new service file in `src/services/`
2. Implement the `generateManimScript` function
3. Update `llmProvider.ts` to include the new provider
4. Add configuration to `.env.example`

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]