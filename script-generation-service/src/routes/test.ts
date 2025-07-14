import { Elysia, t } from 'elysia';
import { llmService } from '../services/llmProvider';
import { generateManimScriptWithOpenRouter } from '../services/openrouter';
import { generateManimScript as generateWithGemini } from '../services/gemini';

/**
 * Test routes for LLM integration - perfect for Postman testing
 */
export const testRoutes = (app: Elysia) => {
  
  // Simple test endpoint to check if LLM is working
  app.get('/test/ping', () => ({
    success: true,
    message: 'Test routes are working!',
    timestamp: new Date().toISOString()
  }), {
    detail: {
      tags: ['Testing'],
      summary: 'Ping test endpoint',
      description: 'Simple endpoint to verify test routes are accessible'
    }
  });

  // Test current LLM provider
  app.get('/test/current-provider', () => ({
    success: true,
    provider: llmService.getProvider(),
    availableProviders: llmService.getAvailableProviders(),
    configuration: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      defaultProvider: process.env.LLM_PROVIDER || 'openrouter'
    }
  }), {
    detail: {
      tags: ['Testing'],
      summary: 'Get current LLM provider info',
      description: 'Shows which LLM provider is currently active and available options'
    }
  });

  // Test OpenRouter directly
  app.post('/test/openrouter', async ({ body }) => {
    const { prompt } = body;
    
    if (!process.env.OPENROUTER_API_KEY) {
      return {
        success: false,
        error: 'OpenRouter API key not configured',
        hint: 'Set OPENROUTER_API_KEY in your .env file'
      };
    }

    try {
      console.log(`🧪 Testing OpenRouter with prompt: ${prompt}`);
      const startTime = Date.now();
      
      const script = await generateManimScriptWithOpenRouter(prompt);
      const endTime = Date.now();
      
      return {
        success: true,
        provider: 'openrouter',
        prompt,
        script,
        executionTime: `${endTime - startTime}ms`,
        scriptLength: script.length,
        preview: script.substring(0, 200) + '...'
      };
    } catch (error) {
      return {
        success: false,
        provider: 'openrouter',
        error: error instanceof Error ? error.message : 'Unknown error',
        prompt
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ 
        default: 'Create a simple circle animation',
        description: 'Mathematical concept to visualize'
      })
    }),
    detail: {
      tags: ['Testing'],
      summary: 'Test OpenRouter directly',
      description: 'Test OpenRouter API integration without abstraction layer'
    }
  });

  // Test Gemini directly (if configured)
  app.post('/test/gemini', async ({ body }) => {
    const { prompt } = body;
    
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        hint: 'Set GEMINI_API_KEY in your .env file'
      };
    }

    try {
      console.log(`🧪 Testing Gemini with prompt: ${prompt}`);
      const startTime = Date.now();
      
      const script = await generateWithGemini(prompt);
      const endTime = Date.now();
      
      return {
        success: true,
        provider: 'gemini',
        prompt,
        script,
        executionTime: `${endTime - startTime}ms`,
        scriptLength: script.length,
        preview: script.substring(0, 200) + '...'
      };
    } catch (error) {
      return {
        success: false,
        provider: 'gemini',
        error: error instanceof Error ? error.message : 'Unknown error',
        prompt
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ 
        default: 'Create a simple circle animation',
        description: 'Mathematical concept to visualize'
      })
    }),
    detail: {
      tags: ['Testing'],
      summary: 'Test Gemini directly',
      description: 'Test Gemini API integration without abstraction layer'
    }
  });

  // Test with different providers
  app.post('/test/compare-providers', async ({ body }) => {
    const { prompt } = body;
    const results: any = {};

    // Test OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const startTime = Date.now();
        const script = await generateManimScriptWithOpenRouter(prompt);
        const endTime = Date.now();
        
        results.openrouter = {
          success: true,
          executionTime: `${endTime - startTime}ms`,
          scriptLength: script.length,
          preview: script.substring(0, 100) + '...'
        };
      } catch (error) {
        results.openrouter = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      results.openrouter = {
        success: false,
        error: 'API key not configured'
      };
    }

    // Test Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const startTime = Date.now();
        const script = await generateWithGemini(prompt);
        const endTime = Date.now();
        
        results.gemini = {
          success: true,
          executionTime: `${endTime - startTime}ms`,
          scriptLength: script.length,
          preview: script.substring(0, 100) + '...'
        };
      } catch (error) {
        results.gemini = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      results.gemini = {
        success: false,
        error: 'API key not configured'
      };
    }

    return {
      prompt,
      results,
      recommendation: results.openrouter?.success ? 'openrouter' : 
                     results.gemini?.success ? 'gemini' : 'none'
    };
  }, {
    body: t.Object({
      prompt: t.String({ 
        default: 'Create a simple circle animation',
        description: 'Mathematical concept to test with both providers'
      })
    }),
    detail: {
      tags: ['Testing'],
      summary: 'Compare providers',
      description: 'Test and compare both OpenRouter and Gemini providers'
    }
  });

  // Test with various mathematical prompts
  app.get('/test/sample-generations', async () => {
    const testPrompts = [
      "Create a simple circle that grows and shrinks",
      "Show a sine wave animation",
      "Visualize the Pythagorean theorem"
    ];

    const results = [];

    for (const prompt of testPrompts) {
      try {
        const startTime = Date.now();
        const script = await llmService.generateManimScript(prompt);
        const endTime = Date.now();

        results.push({
          prompt,
          success: true,
          provider: llmService.getProvider(),
          executionTime: `${endTime - startTime}ms`,
          scriptLength: script.length,
          hasValidStructure: script.includes('class') && script.includes('Scene') && script.includes('construct')
        });
      } catch (error) {
        results.push({
          prompt,
          success: false,
          provider: llmService.getProvider(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      provider: llmService.getProvider(),
      totalTests: testPrompts.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }, {
    detail: {
      tags: ['Testing'],
      summary: 'Run sample generations',
      description: 'Test LLM with multiple sample prompts and check results'
    }
  });

  // Test error handling
  app.post('/test/error-handling', async ({ body }) => {
    const { scenario } = body;
    
    try {
      switch (scenario) {
        case 'invalid-prompt':
          return await llmService.generateManimScript('');
          
        case 'very-long-prompt':
          const longPrompt = 'Create an animation that ' + 'shows many things '.repeat(100);
          return await llmService.generateManimScript(longPrompt);
          
        case 'special-characters':
          return await llmService.generateManimScript('Create animation with 特殊字符 and émojis 🎨');
          
        case 'switch-provider':
          const originalProvider = llmService.getProvider();
          const newProvider = originalProvider === 'openrouter' ? 'gemini' : 'openrouter';
          llmService.setProvider(newProvider as any);
          const result = await llmService.generateManimScript('Test after provider switch');
          llmService.setProvider(originalProvider as any);
          return {
            success: true,
            originalProvider,
            testedProvider: newProvider,
            script: result
          };
          
        default:
          return {
            success: false,
            error: 'Unknown test scenario',
            availableScenarios: ['invalid-prompt', 'very-long-prompt', 'special-characters', 'switch-provider']
          };
      }
    } catch (error) {
      return {
        success: false,
        scenario,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name
      };
    }
  }, {
    body: t.Object({
      scenario: t.String({ 
        default: 'invalid-prompt',
        description: 'Error scenario to test'
      })
    }),
    detail: {
      tags: ['Testing'],
      summary: 'Test error handling',
      description: 'Test how the service handles various error scenarios'
    }
  });

  // Raw API test - direct HTTP request to OpenRouter
  app.post('/test/raw-openrouter', async ({ body }) => {
    const { prompt, model = 'deepseek/deepseek-chat', temperature = 0.7 } = body;
    
    if (!process.env.OPENROUTER_API_KEY) {
      return {
        success: false,
        error: 'OpenRouter API key not configured'
      };
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/math-video-generation',
          'X-Title': 'Math Video Generation Test'
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Respond concisely.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: 500
        })
      });

      const data = await response.json();

      return {
        success: response.ok,
        status: response.status,
        headers: {
          'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
          'x-ratelimit-reset': response.headers.get('x-ratelimit-reset')
        },
        response: data,
        model,
        temperature
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ 
        default: 'Hello, can you help me?',
        description: 'Prompt to send to OpenRouter'
      }),
      model: t.Optional(t.String({ 
        default: 'deepseek/deepseek-chat',
        description: 'Model to use'
      })),
      temperature: t.Optional(t.Number({ 
        default: 0.7,
        minimum: 0,
        maximum: 2,
        description: 'Temperature for generation'
      }))
    }),
    detail: {
      tags: ['Testing'],
      summary: 'Raw OpenRouter API test',
      description: 'Test direct HTTP request to OpenRouter API'
    }
  });

  return app;
};