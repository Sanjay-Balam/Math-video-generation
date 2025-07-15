import { Elysia, t } from 'elysia';
import { llmService, validateManimScript } from '../services/llmProvider';
import { generateEnhancedManimScript } from '../services/enhancedGemini';
import { saveScriptToFile } from '../services/fileManager';

export const manimRoutes = (app: Elysia) => {
  // Efficient Manim script generation
  app.post('/manim/generate', async ({ body }) => {
    const { prompt, mode = 'fast', saveToFile = true } = body;
    
    try {
      const optimizedPrompt = buildPrompt(prompt, mode);
      const script = await llmService.generateManimScript(optimizedPrompt);
      const validation = validateManimScript(script);
      
      let fileInfo = null;
      if (saveToFile) {
        try {
          fileInfo = await saveScriptToFile(script, prompt);
        } catch (error) {
          console.error('Save failed:', error);
        }
      }
      
      return {
        success: true,
        script: fileInfo?.perfectScript || script,
        validation,
        file: fileInfo ? {
          filename: fileInfo.filename,
          path: fileInfo.filepath
        } : null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ minLength: 10, maxLength: 500 }),
      mode: t.Optional(t.Union([
        t.Literal('fast'),
        t.Literal('quality'),
        t.Literal('minimal')
      ], { default: 'fast' })),
      saveToFile: t.Optional(t.Boolean({ default: true }))
    }),
    detail: {
      tags: ['Manim Generation'],
      summary: 'Generate efficient Manim script',
      description: 'Generate optimized Manim Python script with minimal tokens'
    }
  });

  // RAG-enhanced generation
  app.post('/manim/generate-enhanced', async ({ body }) => {
    const { prompt, saveToFile = true } = body;
    
    try {
      const result = await generateEnhancedManimScript(prompt);
      const validation = validateManimScript(result.script);
      
      let fileInfo = null;
      if (saveToFile) {
        try {
          fileInfo = await saveScriptToFile(result.script, prompt);
        } catch (error) {
          console.error('Save failed:', error);
        }
      }
      
      return {
        success: true,
        script: fileInfo?.perfectScript || result.script,
        validation,
        contextUsed: result.contextUsed,
        file: fileInfo ? {
          filename: fileInfo.filename,
          path: fileInfo.filepath
        } : null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: t.Object({
      prompt: t.String({ minLength: 10, maxLength: 500 }),
      saveToFile: t.Optional(t.Boolean({ default: true }))
    }),
    detail: {
      tags: ['Manim Generation'],
      summary: 'Generate enhanced Manim script with RAG',
      description: 'Generate Manim script using retrieval augmented generation'
    }
  });

  // Performance analysis
  app.post('/manim/analyze', async ({ body }) => {
    const { script } = body;
    
    try {
      const analysis = analyzeScript(script);
      const suggestions = getSuggestions(analysis);
      
      return {
        success: true,
        analysis,
        suggestions,
        score: analysis.score
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, {
    body: t.Object({
      script: t.String({ minLength: 50 })
    }),
    detail: {
      tags: ['Manim Generation'],
      summary: 'Analyze Manim script performance',
      description: 'Analyze script for performance and optimization'
    }
  });

  // Get optimization tips
  app.get('/manim/tips', () => ({
    success: true,
    tips: [
      "Use simple shapes for better performance",
      "Batch animations with AnimationGroup",
      "Set appropriate run_time values",
      "Use VGroup for object grouping",
      "Minimize text objects",
      "Test with low quality first"
    ]
  }), {
    detail: {
      tags: ['Manim Generation'],
      summary: 'Get optimization tips',
      description: 'Get concise Manim optimization tips'
    }
  });

  return app;
};

// Optimized helper functions
function buildPrompt(prompt: string, mode: string): string {
  const modes = {
    fast: "Create efficient Manim script. Use simple shapes, minimal animations, fast rendering.",
    quality: "Create high-quality Manim script. Focus on visual appeal, smooth animations.",
    minimal: "Create minimal Manim script. Basic visualization, few objects, quick render."
  };
  
  return `${prompt}\n\nMode: ${modes[mode as keyof typeof modes]}\n\nRequirements:\n- Use manim community edition\n- Include imports and class\n- Keep it concise\n- Make it runnable`;
}

function analyzeScript(script: string): any {
  const lines = script.split('\n').length;
  const objects = (script.match(/\w+\(/g) || []).length;
  const animations = (script.match(/\.animate/g) || []).length;
  const complexity = Math.min(100, (objects * 2) + (animations * 3));
  
  return {
    lines,
    objects,
    animations,
    complexity,
    score: Math.max(0, 100 - complexity)
  };
}

function getSuggestions(analysis: any): string[] {
  const suggestions = [];
  
  if (analysis.animations > 10) {
    suggestions.push("Use AnimationGroup for batching");
  }
  
  if (analysis.objects > 20) {
    suggestions.push("Reduce object count");
  }
  
  if (analysis.complexity > 70) {
    suggestions.push("Split into multiple scenes");
  }
  
  return suggestions;
}