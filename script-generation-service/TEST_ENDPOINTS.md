# Test Endpoints Documentation

This document describes all test endpoints available for testing the LLM integration locally with Postman or any HTTP client.

## Base URL
```
http://localhost:5000
```

## Test Endpoints

### 1. Basic Health Checks

#### Ping Test
- **GET** `/test/ping`
- **Description**: Simple endpoint to verify test routes are working
- **Response**:
```json
{
  "success": true,
  "message": "Test routes are working!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Current Provider Info
- **GET** `/test/current-provider`
- **Description**: Shows which LLM provider is currently active
- **Response**:
```json
{
  "success": true,
  "provider": "openrouter",
  "availableProviders": ["openrouter"],
  "configuration": {
    "openrouter": true,
    "gemini": false,
    "defaultProvider": "openrouter"
  }
}
```

### 2. Direct Provider Tests

#### Test OpenRouter
- **POST** `/test/openrouter`
- **Description**: Test OpenRouter API directly
- **Body**:
```json
{
  "prompt": "Create a simple circle animation"
}
```
- **Response**:
```json
{
  "success": true,
  "provider": "openrouter",
  "prompt": "Create a simple circle animation",
  "script": "from manim import *\n\nclass SimpleCircle(Scene)...",
  "executionTime": "1234ms",
  "scriptLength": 256,
  "preview": "from manim import *\n\nclass SimpleCircle(Scene):\n    def construct(self):\n        circle = Circle(radius=2, color=BLUE)..."
}
```

#### Test Gemini
- **POST** `/test/gemini`
- **Description**: Test Gemini API directly (requires GEMINI_API_KEY)
- **Body**: Same as OpenRouter test
- **Response**: Similar structure to OpenRouter

### 3. Provider Comparison

#### Compare Providers
- **POST** `/test/compare-providers`
- **Description**: Test and compare both providers with the same prompt
- **Body**:
```json
{
  "prompt": "Show a sine wave animation"
}
```
- **Response**:
```json
{
  "prompt": "Show a sine wave animation",
  "results": {
    "openrouter": {
      "success": true,
      "executionTime": "1234ms",
      "scriptLength": 512,
      "preview": "from manim import..."
    },
    "gemini": {
      "success": false,
      "error": "API key not configured"
    }
  },
  "recommendation": "openrouter"
}
```

### 4. Batch Testing

#### Sample Generations
- **GET** `/test/sample-generations`
- **Description**: Run multiple test prompts automatically
- **Response**:
```json
{
  "provider": "openrouter",
  "totalTests": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    {
      "prompt": "Create a simple circle that grows and shrinks",
      "success": true,
      "provider": "openrouter",
      "executionTime": "1234ms",
      "scriptLength": 456,
      "hasValidStructure": true
    }
  ]
}
```

### 5. Error Handling Tests

#### Test Error Scenarios
- **POST** `/test/error-handling`
- **Description**: Test various error scenarios
- **Body**:
```json
{
  "scenario": "invalid-prompt"
}
```
- **Available Scenarios**:
  - `invalid-prompt`: Test with empty prompt
  - `very-long-prompt`: Test with extremely long prompt
  - `special-characters`: Test with unicode and emojis
  - `switch-provider`: Test provider switching

### 6. Raw API Test

#### Raw OpenRouter API
- **POST** `/test/raw-openrouter`
- **Description**: Direct HTTP request to OpenRouter API
- **Body**:
```json
{
  "prompt": "What is 2+2?",
  "model": "deepseek/deepseek-chat",
  "temperature": 0.7
}
```
- **Response**: Shows raw API response including headers and rate limits

## Standard Generation Endpoints

### Generate Script
- **POST** `/api/generate-script`
- **Body**:
```json
{
  "prompt": "Visualize the Pythagorean theorem",
  "saveToFile": true
}
```

### Validate Script
- **POST** `/api/validate-script`
- **Body**:
```json
{
  "script": "from manim import *\n\nclass TestScene(Scene):\n    def construct(self):\n        pass"
}
```

## Testing with Postman

1. **Import Collection**: Import the `postman-collection.json` file into Postman
2. **Set Environment**: Make sure the service is running on `http://localhost:5000`
3. **Run Tests**: Execute requests in order, starting with health checks

## Testing with cURL

```bash
# Ping test
curl http://localhost:5000/test/ping

# Check current provider
curl http://localhost:5000/test/current-provider

# Test OpenRouter
curl -X POST http://localhost:5000/test/openrouter \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a simple circle animation"}'

# Run sample generations
curl http://localhost:5000/test/sample-generations
```

## Common Test Cases

1. **Basic Functionality**
   - Service is running
   - OpenRouter API key is configured
   - Can generate simple scripts

2. **Script Quality**
   - Generated scripts have proper Manim structure
   - Scripts include necessary imports
   - Scripts have Scene class and construct method

3. **Error Handling**
   - Service handles missing API keys gracefully
   - Service handles invalid prompts
   - Service provides meaningful error messages

4. **Performance**
   - Generation time is reasonable (< 5 seconds)
   - Service handles concurrent requests
   - Memory usage is stable

## Troubleshooting

- **"API key not configured"**: Check your `.env` file has `OPENROUTER_API_KEY`
- **Connection refused**: Make sure service is running with `bun run dev`
- **Rate limit errors**: OpenRouter free tier has daily limits
- **Invalid scripts**: Check the prompt is mathematical in nature