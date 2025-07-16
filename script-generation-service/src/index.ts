import { config } from 'dotenv';
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { videoRoutes } from './routes/video';
import { testRoutes } from './routes/test';
import { manimRoutes } from './routes/manim';
import { llmService } from './services/llmProvider';

// Load environment variables
config();

console.log('🚀 Starting Math Video Generator API...');
console.log(`📌 Using LLM Provider: ${process.env.LLM_PROVIDER || 'openrouter'}`);

// Create Elysia app
const app = new Elysia();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));

app.use(swagger({
  documentation: {
    info: {
      title: 'Math Video Generator API',
      version: '1.0.0',
      description: 'API for generating Manim Python scripts using LLM providers'
    },
    tags: [
      { name: 'Script Generation', description: 'Manim script generation endpoints' },
      { name: 'Manim Generation', description: 'Dedicated optimized Manim script generation' },
      { name: 'Testing', description: 'Test endpoints for LLM integration' },
      { name: 'Script Management', description: 'Manage generated scripts' },
      { name: 'Vector Search', description: 'Vector database operations' }
    ]
  }
}));

// Register routes
videoRoutes(app);
testRoutes(app);
manimRoutes(app);

// Health check endpoints
app.get('/', () => ({
  message: 'Math Video Generator API',
  version: '1.0.0',
  status: 'running',
  llmProvider: llmService.getProvider(),
  endpoints: {
    docs: '/swagger',
    generateScript: '/api/generate-script',
    validateScript: '/api/validate-script',
    samplePrompts: '/api/sample-prompts',
    testLLM: '/api/test-llm',
    providerInfo: '/api/provider-info',
    testEndpoints: '/test/*',
    manimGenerate: '/api/manim/generate',
    manimEnhanced: '/api/manim/generate-enhanced',
    manimAnalyze: '/api/manim/analyze',
    manimTips: '/api/manim/tips'
  }
}));

app.get('/health', () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  llmProvider: llmService.getProvider(),
  availableProviders: llmService.getAvailableProviders()
}));

// New endpoint to get provider information
app.get('/api/provider-info', () => ({
  currentProvider: llmService.getProvider(),
  availableProviders: llmService.getAvailableProviders(),
  configuration: {
    openrouter: !!process.env.OPENROUTER_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY
  }
}));

app.listen(process.env.PORT as string);

console.log(`🦊 Elysia server is running at http://localhost:${process.env.PORT}`);
console.log(`📖 API Documentation: http://localhost:${process.env.PORT}/swagger`);
console.log(`🤖 LLM Provider: ${llmService.getProvider()}`);
console.log(`🔑 OpenRouter configured: ${process.env.OPENROUTER_API_KEY ? '✅' : '❌'}`);
console.log(`🔑 Gemini configured: ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);

export type App = typeof app;
