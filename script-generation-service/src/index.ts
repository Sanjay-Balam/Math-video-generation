import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { videoRoutes } from './routes/video';

console.log('🚀 Starting Math Video Generator API...');

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
      description: 'API for generating Manim Python scripts using Gemini AI'
    },
    tags: [
      { name: 'Script Generation', description: 'Manim script generation endpoints' }
    ]
  }
}));

// Register routes
videoRoutes(app);

// Health check endpoints
app.get('/', () => ({
  message: 'Math Video Generator API',
  version: '1.0.0',
  status: 'running',
  endpoints: {
    docs: '/swagger',
    generateScript: '/api/generate-script',
    validateScript: '/api/validate-script',
    samplePrompts: '/api/sample-prompts'
  }
}));

app.get('/health', () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  geminiConfigured: !!process.env.GEMINI_API_KEY
}));

app.listen(process.env.PORT as string);

console.log(`🦊 Elysia server is running at http://localhost:${process.env.PORT}`);
console.log(`📖 API Documentation: http://localhost:${process.env.PORT}/swagger`);
console.log(`🔑 Gemini API configured: ${process.env.GEMINI_API_KEY ? '✅' : '❌'}`);

export type App = typeof app;
