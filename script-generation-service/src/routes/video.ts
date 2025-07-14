import { Elysia, t } from 'elysia';
import { llmService, validateManimScript } from '../services/llmProvider';
import { generateEnhancedManimScript } from '../services/enhancedGemini';
import { qdrantService } from '../services/qdrant';
import { 
  saveScriptToFile, 
  getGeneratedScripts, 
  readScriptFile, 
  deleteScriptFile 
} from '../services/fileManager';

/**
 * Registers video-related routes on the given Elysia app instance.
 */
export const videoRoutes = (app: Elysia) => {
  // Generate Manim script endpoint with file saving
  app.post('/generate-script', async ({ body }) => {
    const { prompt, saveToFile} = body;
    
    try {
      console.log(`Generating Manim script for prompt: ${prompt}`);
      
      // Generate Manim script using configured LLM provider
      const script = await llmService.generateManimScript(prompt);
      
      // Validate the generated script
      const validation = validateManimScript(script);
      
      let fileInfo = null;
      if (saveToFile) {
        try {
          fileInfo = await saveScriptToFile(script, prompt);
          console.log(`Script saved to: ${fileInfo.filepath}`);
        } catch (error) {
          console.error('Failed to save script to file:', error);
        }
      }
      
      return {
        success: true,
        prompt,
        script: fileInfo?.perfectScript || script,
        validation,
        file: fileInfo ? {
          filename: fileInfo.filename,
          saved: true,
          path: fileInfo.filepath
        } : null,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating script:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        prompt
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ 
        minLength: 10, 
        maxLength: 1000,
        description: 'Mathematical concept to visualize'
      }),
      saveToFile: t.Optional(t.Boolean({
        description: 'Whether to save the generated script to a file',
        default: true
      }))
    }),
    detail: {
      tags: ['Script Generation'],
      summary: 'Generate Manim Python script',
      description: 'Generate a Manim Python script from a mathematical prompt using Gemini AI and optionally save it to a file'
    }
  });

  // Get list of generated script files
  app.get('/scripts', async () => {
    try {
      const scripts = await getGeneratedScripts();
      return {
        success: true,
        scripts,
        count: scripts.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    detail: {
      tags: ['Script Management'],
      summary: 'Get list of generated scripts',
      description: 'Retrieve a list of all generated Manim scripts with metadata'
    }
  });

  // Get a specific script file
  app.get('/scripts/:filename', async ({ params }) => {
    const { filename } = params;
    
    try {
      const script = await readScriptFile(filename);
      return {
        success: true,
        filename,
        script
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File not found',
        filename
      };
    }
  }, {
    params: t.Object({
      filename: t.String({ description: 'Name of the script file' })
    }),
    detail: {
      tags: ['Script Management'],
      summary: 'Get script content',
      description: 'Retrieve the content of a specific generated script file'
    }
  });

  // Delete a script file
  app.delete('/scripts/:filename', async ({ params }) => {
    const { filename } = params;
    
    try {
      await deleteScriptFile(filename);
      return {
        success: true,
        message: `Script ${filename} deleted successfully`,
        filename
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        filename
      };
    }
  }, {
    params: t.Object({
      filename: t.String({ description: 'Name of the script file to delete' })
    }),
    detail: {
      tags: ['Script Management'],
      summary: 'Delete script file',
      description: 'Delete a specific generated script file'
    }
  });

  // Validate script endpoint
  app.post('/validate-script', async ({ body }) => {
    const { script } = body;
    
    try {
      const validation = validateManimScript(script);
      
      return {
        success: true,
        validation,
        script: script.substring(0, 200) + '...' // Show first 200 chars
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: t.Object({
      script: t.String({ 
        minLength: 50,
        description: 'Python Manim script to validate'
      })
    }),
    detail: {
      tags: ['Script Generation'],
      summary: 'Validate Manim script',
      description: 'Validate a Manim Python script for basic syntax and structure'
    }
  });

  // Get sample prompts
  app.get('/sample-prompts', () => {
    return {
      prompts: [
        "Visualize the Pythagorean theorem with animated squares on each side of a right triangle",
        "Create an animation showing how sine and cosine waves are generated from a unit circle",
        "Demonstrate the concept of limits by showing a function approaching a value",
        "Show the visual proof of the sum of first n natural numbers using triangular arrangements",
        "Animate the process of finding the derivative of x^2 using the limit definition",
        "Create a visualization of complex number multiplication in the complex plane",
        "Show how the quadratic formula works by completing the square visually",
        "Demonstrate the relationship between exponential and logarithmic functions",
        "Visualize matrix multiplication using geometric transformations",
        "Create an animation showing the convergence of the Fibonacci ratio to the golden ratio"
      ]
    };
  }, {
    detail: {
      tags: ['Script Generation'],
      summary: 'Get sample prompts',
      description: 'Get a list of sample mathematical prompts for testing'
    }
  });

  // Test LLM API connection
  app.get('/test-llm', async () => {
    try {
      const testScript = await llmService.generateManimScript("Create a simple circle animation");
      return {
        success: true,
        message: `${llmService.getProvider()} API is working correctly`,
        sampleOutput: testScript
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `${llmService.getProvider()} API connection failed`
      };
    }
  }, {
    detail: {
      tags: ['Script Generation'],
      summary: 'Test LLM API connection',
      description: 'Test if the LLM API is properly configured and working'
    }
  });

  // New endpoint in script-generation-service
  app.post('/generate-and-render', async ({ body }) => {
    const { prompt, saveToFile } = body as { prompt: string, saveToFile?: boolean };
    
    let fileInfo = null;
    
    try {
      console.log(`Starting generate-and-render for prompt: ${prompt}`);
      
      // Generate script
      const script = await llmService.generateManimScript(prompt);
      console.log('Script generated successfully');
      
      if (saveToFile) {
        fileInfo = await saveScriptToFile(script, prompt);
        console.log(`Script saved to: ${fileInfo.filepath}`);
      }

      // Configure video service URL (use localhost for local development)
      const videoServiceUrl = process.env.VIDEO_SERVICE_URL || 'http://localhost:8001';
      
      console.log(`Sending request to video service: ${videoServiceUrl}`);
      
      // Send to video service with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const videoResponse = await fetch(`${videoServiceUrl}/api/v1/generate/script`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          script_content: fileInfo?.perfectScript || script,
          script_name: fileInfo?.filename.replace('.py', '') || prompt.substring(0, 50),
          quality: "medium_quality",
          format: "mp4",
          frame_rate: 30
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        console.error(`Video service responded with ${videoResponse.status}: ${errorText}`);
        throw new Error(`Video service error (${videoResponse.status}): ${errorText}`);
      }

      const videoJob = await videoResponse.json();
      console.log('Video job created successfully:', videoJob);
      
      return {
        success: true,
        script: fileInfo,
        video_job: videoJob,
        message: 'Script generated and video compilation started'
      };
    } catch (error) {
      console.error('Error in generate-and-render:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request to video service timed out';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to video generation service. Please ensure it is running on http://localhost:8001';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        script: fileInfo
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ 
        minLength: 10, 
        maxLength: 1000,
        description: 'Mathematical concept to visualize'
      }),
      saveToFile: t.Optional(t.Boolean({
        description: 'Whether to save the generated script to a file',
        default: true
      }))
    }),
    detail: {
      tags: ['Script Generation'],
      summary: 'Generate script and render video',
      description: 'Generate a Manim Python script and automatically send it to the video generation service for rendering'
    }
  });

  // Enhanced generate script endpoint with RAG
  app.post('/generate-script-enhanced', async ({ body }) => {
    const { prompt, saveToFile, useRAG = true } = body;
    
    try {
      console.log(`Generating enhanced Manim script for prompt: ${prompt}`);
      
      let result;
      if (useRAG) {
        result = await generateEnhancedManimScript(prompt);
      } else {
        const script = await llmService.generateManimScript(prompt);
        result = { script, similarScripts: [], contextUsed: false };
      }
      
      // Validate the generated script
      const validation = validateManimScript(result.script);
      
      let fileInfo = null;
      if (saveToFile) {
        try {
          fileInfo = await saveScriptToFile(result.script, prompt);
          console.log(`Script saved to: ${fileInfo.filepath}`);
        } catch (error) {
          console.error('Failed to save script to file:', error);
        }
      }
      
      return {
        success: true,
        prompt,
        script: fileInfo?.perfectScript || result.script,
        validation,
        similar_scripts: result.similarScripts,
        context_used: result.contextUsed,
        file: fileInfo ? {
          filename: fileInfo.filename,
          saved: true,
          path: fileInfo.filepath
        } : null,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating enhanced script:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        prompt
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ 
        minLength: 10, 
        maxLength: 1000,
        description: 'Mathematical concept to visualize'
      }),
      saveToFile: t.Optional(t.Boolean({
        description: 'Whether to save the generated script to a file',
        default: true
      })),
      useRAG: t.Optional(t.Boolean({
        description: 'Whether to use RAG (Retrieval Augmented Generation)',
        default: true
      }))
    }),
    detail: {
      tags: ['Script Generation'],
      summary: 'Generate enhanced Manim Python script with RAG',
      description: 'Generate a Manim Python script using RAG with similar examples from vector database'
    }
  });

  // Get similar scripts endpoint (enhanced)
  app.post('/similar-scripts', async ({ body }) => {
    const { prompt, limit = 5, useEnhanced = true } = body;
    
    try {
      let similarScripts;
      
      if (useEnhanced) {
        similarScripts = await qdrantService.findSimilarScriptsEnhanced(prompt, limit);
      } else {
        similarScripts = await qdrantService.findSimilarScripts(prompt, limit);
      }
      
      return {
        success: true,
        prompt,
        similar_scripts: similarScripts,
        count: similarScripts.length,
        method: useEnhanced ? 'enhanced' : 'vector-only'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ description: 'Search prompt' }),
      limit: t.Optional(t.Number({ minimum: 1, maximum: 20, default: 5 })),
      useEnhanced: t.Optional(t.Boolean({ description: 'Use enhanced hybrid search', default: true }))
    }),
    detail: {
      tags: ['Vector Search'],
      summary: 'Find similar scripts (enhanced)',
      description: 'Search for similar scripts using hybrid vector + text matching'
    }
  });

  // Get scripts by tags
  app.post('/scripts-by-tags', async ({ body }) => {
    const { tags, limit = 5 } = body;
    
    try {
      const scripts = await qdrantService.getScriptsByTags(tags, limit);
      
      return {
        success: true,
        tags,
        scripts,
        count: scripts.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: t.Object({
      tags: t.Array(t.String(), { description: 'Tags to search for' }),
      limit: t.Optional(t.Number({ minimum: 1, maximum: 20, default: 5 }))
    }),
    detail: {
      tags: ['Vector Search'],
      summary: 'Get scripts by tags',
      description: 'Retrieve scripts that match specific tags'
    }
  });

  // Vector DB status endpoint
  app.get('/vector-db-status', async () => {
    try {
      const collectionInfo = await qdrantService.getCollectionInfo();
      
      return {
        success: true,
        status: 'connected',
        collection_info: collectionInfo
      };
    } catch (error) {
      return {
        success: false,
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    detail: {
      tags: ['Vector Search'],
      summary: 'Check vector DB status',
      description: 'Check the status and info of the Qdrant vector database'
    }
  });

  // Add this new endpoint for fuzzy text search
  app.post('/search-scripts-fuzzy', async ({ body }) => {
    const { prompt, limit = 5, threshold = 0.3 } = body;
    
    try {
      const scripts = await qdrantService.findScriptsByTextMatch(prompt, limit);
      
      return {
        success: true,
        prompt,
        scripts: scripts.filter(s => s.similarity_score >= threshold),
        count: scripts.length,
        method: 'fuzzy-text-match'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ description: 'Search prompt' }),
      limit: t.Optional(t.Number({ minimum: 1, maximum: 20, default: 5 })),
      threshold: t.Optional(t.Number({ minimum: 0, maximum: 1, default: 0.3 }))
    }),
    detail: {
      tags: ['Vector Search'],
      summary: 'Fuzzy text search for scripts',
      description: 'Search for scripts using fuzzy text matching on prompts'
    }
  });

  return app;
}; 