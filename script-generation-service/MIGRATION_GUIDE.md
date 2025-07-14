# Migration Guide: Switching from Gemini to OpenRouter

This guide helps you migrate from Google Gemini API to the free OpenRouter API with DeepSeek V3.

## Why Switch to OpenRouter?

1. **No Credit Card Required**: OpenRouter offers a genuine free tier
2. **No Trial Expiration**: Unlike Gemini, the free tier doesn't expire
3. **Excellent Code Generation**: DeepSeek V3 excels at generating code
4. **Simple Migration**: Minimal code changes required

## Migration Steps

### 1. Get Your OpenRouter API Key

1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for a free account (no credit card needed)
3. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

### 2. Update Your Environment Variables

Edit your `.env` file:

```bash
# Change the provider to openrouter
LLM_PROVIDER=openrouter

# Add your OpenRouter API key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Keep Gemini as fallback (optional)
GEMINI_API_KEY=your-existing-gemini-key
```

### 3. Test the Migration

Run the test script:
```bash
bun run test-openrouter.ts
```

Or test via API:
```bash
# Check provider info
curl http://localhost:5000/api/provider-info

# Test generation
curl http://localhost:5000/api/test-llm
```

### 4. No Code Changes Needed!

The service automatically uses the configured provider. All your existing API calls will work without modification.

## Feature Comparison

| Feature | Gemini | OpenRouter (DeepSeek V3) |
|---------|--------|------------------------|
| Free Tier | Trial only | Permanent |
| Credit Card | Required after trial | Never required |
| Daily Limit | Varies | 50-1000 requests |
| Code Quality | Excellent | Excellent |
| Context Length | 8k tokens | 128k tokens |
| Response Speed | Fast | Fast |

## Rollback Option

If you need to switch back to Gemini:

```bash
# In .env
LLM_PROVIDER=gemini
```

The service will automatically use Gemini instead.

## Dual Provider Setup

For maximum reliability, configure both providers:

```bash
# Primary provider
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=your-openrouter-key

# Fallback provider
GEMINI_API_KEY=your-gemini-key
```

The service will automatically fallback to Gemini if OpenRouter fails.

## Troubleshooting

### "API key not found" error
- Ensure `OPENROUTER_API_KEY` is set in your `.env` file
- Restart the service after updating `.env`

### Rate limit errors
- Free tier allows 50-1000 requests/day
- Consider implementing caching
- Use the vector DB for similar requests

### Different output quality
- DeepSeek V3 may generate slightly different code styles
- Both providers produce working Manim scripts
- Adjust prompts if needed for better results

## Support

- OpenRouter Documentation: [https://openrouter.ai/docs](https://openrouter.ai/docs)
- OpenRouter Status: [https://status.openrouter.ai/](https://status.openrouter.ai/)
- Community Discord: [OpenRouter Discord](https://discord.gg/openrouter)