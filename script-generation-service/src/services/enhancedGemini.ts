import { llmService } from './llmProvider';
import { qdrantService, type SimilarScript } from './qdrant';

export async function generateEnhancedManimScript(prompt: string): Promise<{
  script: string;
  similarScripts: SimilarScript[];
  contextUsed: boolean;
}> {
  try {
    // Get similar scripts from vector DB
    const similarScripts = await qdrantService.findSimilarScripts(prompt, 3);
    
    // Build enhanced prompt with context examples
    const contextExamples = similarScripts.length > 0 
      ? `\n\nCONTEXT - Here are similar successful scripts for reference:\n${
          similarScripts.map((script, idx) => 
            `Example ${idx + 1} (similarity: ${(script.similarity_score * 100).toFixed(1)}%):\nPrompt: "${script.prompt}"\nScript:\n${script.script}\n---`
          ).join('\n\n')
        }\n\nUse these examples as inspiration but create something unique for the current prompt.`
      : '';

    // Create enhanced prompt with context
    const enhancedPrompt = contextExamples ? `${prompt}\n${contextExamples}` : prompt;

    // Generate script using the LLM provider
    const script = await llmService.generateManimScript(enhancedPrompt);

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