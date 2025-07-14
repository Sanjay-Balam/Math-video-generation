import { generateManimScript as generateWithGemini, validateManimScript } from './gemini';
import { generateManimScriptWithOpenRouter } from './openrouter';

export type LLMProvider = 'gemini' | 'openrouter';

interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
}

class LLMService {
  private provider: LLMProvider;

  constructor() {
    // Get provider from environment variable, default to openrouter (free)
    this.provider = (process.env.LLM_PROVIDER as LLMProvider) || 'openrouter';
    
    console.log(`Using LLM Provider: ${this.provider}`);
  }

  async generateManimScript(prompt: string): Promise<string> {
    try {
      switch (this.provider) {
        case 'gemini':
          return await generateWithGemini(prompt);
        
        case 'openrouter':
          return await generateManimScriptWithOpenRouter(prompt);
        
        default:
          throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }
    } catch (error) {
      // If primary provider fails, try fallback
      console.error(`Error with ${this.provider}:`, error);
      
      // Fallback logic
      if (this.provider === 'openrouter' && process.env.GEMINI_API_KEY) {
        console.log('Attempting fallback to Gemini...');
        return await generateWithGemini(prompt);
      } else if (this.provider === 'gemini' && process.env.OPENROUTER_API_KEY) {
        console.log('Attempting fallback to OpenRouter...');
        return await generateManimScriptWithOpenRouter(prompt);
      }
      
      throw error;
    }
  }

  validateScript(script: string) {
    return validateManimScript(script);
  }

  getProvider(): LLMProvider {
    return this.provider;
  }

  setProvider(provider: LLMProvider) {
    this.provider = provider;
    console.log(`LLM Provider changed to: ${provider}`);
  }

  getAvailableProviders(): LLMProvider[] {
    const providers: LLMProvider[] = [];
    
    if (process.env.GEMINI_API_KEY) {
      providers.push('gemini');
    }
    
    if (process.env.OPENROUTER_API_KEY) {
      providers.push('openrouter');
    }
    
    return providers;
  }
}

// Export singleton instance
export const llmService = new LLMService();

// Export types and functions for backward compatibility
export { validateManimScript };