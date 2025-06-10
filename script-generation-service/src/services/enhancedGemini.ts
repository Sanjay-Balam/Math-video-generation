import { GoogleGenerativeAI } from '@google/generative-ai';
import { qdrantService, type SimilarScript } from './qdrant';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateEnhancedManimScript(prompt: string): Promise<{
  script: string;
  similarScripts: SimilarScript[];
  contextUsed: boolean;
}> {
  try {
    // Get similar scripts from vector DB
    const similarScripts = await qdrantService.findSimilarScripts(prompt, 3);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build enhanced system prompt with context
    const contextExamples = similarScripts.length > 0 
      ? `\n\nCONTEXT - Here are similar successful scripts for reference:\n${
          similarScripts.map((script, idx) => 
            `Example ${idx + 1} (similarity: ${(script.similarity_score * 100).toFixed(1)}%):\nPrompt: "${script.prompt}"\nScript:\n${script.script}\n---`
          ).join('\n\n')
        }\n\nUse these examples as inspiration but create something unique for the current prompt.`
      : '';

    const systemPrompt = `You are an expert in mathematical visualization and Manim (Mathematical Animation Engine). 
Your task is to generate clean, working Python Manim scripts that create educational mathematical animations.

IMPORTANT GUIDELINES:
1. Always create a class that inherits from Scene
2. Use the construct() method to define the animation
3. Focus on clear, educational visualizations
4. Use appropriate Manim objects like MathTex, Text, NumberPlane, Circle, Square, etc.
5. Include smooth animations with self.play()
6. Add self.wait() for pauses between animations
7. Keep the code clean and well-commented
8. Ensure the script is complete and runnable
9. Use proper imports from manim
10. Make animations engaging and educational

CRITICAL LATEX RULES:
- ALWAYS use complete LaTeX expressions in MathTex
- For fractions: use \\frac{numerator}{denominator} with BOTH parts
- For square roots: use \\sqrt{expression}
- For subscripts: use _{subscript}
- For superscripts: use ^{superscript}
- NEVER leave incomplete LaTeX like \\frac{-b without closing braces
- Always balance your braces { and }

CRITICAL PYTHON/MANIM RULES:
- When creating lists of MathTex objects, access them with [0], [1], [2], etc.
- NEVER use .get_left(), .get_center(), .get_right() on lists
- Only use .get_left(), .get_center(), .get_right() on individual MathTex objects
- Use VGroup(*list_name) to group list elements, then animate the VGroup
- For individual elements from lists, use list_name[0], list_name[1], etc.${contextExamples}

Now generate a Manim script for the following prompt. Return ONLY the Python code, no explanations or markdown formatting:`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let script = response.text();

    // Clean up the response
    script = script.replace(/```python\s*/g, '').replace(/```\s*/g, '');
    script = script.trim();

    // Validate basic structure
    if (!script.includes('from manim import') && !script.includes('import manim')) {
      script = `from manim import *\n\n${script}`;
    }

    if (!script.includes('class') || !script.includes('Scene') || !script.includes('construct')) {
      throw new Error('Generated script does not contain valid Manim class structure');
    }

    // Store the successful generation in vector DB
    try {
      await qdrantService.storeScript({
        prompt,
        script,
        tags: extractTags(prompt),
        complexity: determineComplexity(prompt),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Failed to store script in vector DB:', error);
    }

    return {
      script,
      similarScripts,
      contextUsed: similarScripts.length > 0,
    };
  } catch (error) {
    console.error('Error generating enhanced Manim script:', error);
    throw new Error(`Failed to generate Manim script: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractTags(prompt: string): string[] {
  const tags: string[] = [];
  const lowercasePrompt = prompt.toLowerCase();
  
  // Mathematical concepts
  if (lowercasePrompt.includes('circle')) tags.push('circle');
  if (lowercasePrompt.includes('square')) tags.push('square');
  if (lowercasePrompt.includes('triangle')) tags.push('triangle');
  if (lowercasePrompt.includes('graph')) tags.push('graph');
  if (lowercasePrompt.includes('function')) tags.push('function');
  if (lowercasePrompt.includes('derivative')) tags.push('calculus', 'derivative');
  if (lowercasePrompt.includes('integral')) tags.push('calculus', 'integral');
  if (lowercasePrompt.includes('matrix')) tags.push('linear-algebra', 'matrix');
  if (lowercasePrompt.includes('vector')) tags.push('linear-algebra', 'vector');
  if (lowercasePrompt.includes('sine') || lowercasePrompt.includes('cosine')) tags.push('trigonometry');
  if (lowercasePrompt.includes('equation')) tags.push('equation');
  if (lowercasePrompt.includes('formula')) tags.push('formula');
  if (lowercasePrompt.includes('theorem')) tags.push('theorem');
  if (lowercasePrompt.includes('proof')) tags.push('proof');
  
  // Animation types
  if (lowercasePrompt.includes('animate') || lowercasePrompt.includes('animation')) tags.push('animation');
  if (lowercasePrompt.includes('transform')) tags.push('transformation');
  if (lowercasePrompt.includes('plot')) tags.push('plotting');
  if (lowercasePrompt.includes('3d')) tags.push('3d');
  
  return tags.length > 0 ? tags : ['general'];
}

function determineComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
  const lowercasePrompt = prompt.toLowerCase();
  
  // Complex indicators
  if (lowercasePrompt.includes('3d') || 
      lowercasePrompt.includes('transformation') ||
      lowercasePrompt.includes('multiple') ||
      lowercasePrompt.includes('advanced') ||
      lowercasePrompt.includes('complex')) {
    return 'complex';
  }
  
  // Medium indicators
  if (lowercasePrompt.includes('graph') ||
      lowercasePrompt.includes('function') ||
      lowercasePrompt.includes('equation') ||
      lowercasePrompt.includes('formula') ||
      lowercasePrompt.includes('theorem')) {
    return 'medium';
  }
  
  return 'simple';
} 