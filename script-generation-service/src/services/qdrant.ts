import { GoogleGenerativeAI } from '@google/generative-ai';

// Dynamic import for Qdrant
// @ts-ignore
const { QdrantClient } = await import('@qdrant/js-client-rest');
export interface ScriptEmbedding {
  id: string;
  prompt: string;
  script: string;
  tags: string[];
  complexity: 'simple' | 'medium' | 'complex';
  validation_score?: number;
  created_at: string;
}

export interface SimilarScript {
  id: string;
  prompt: string;
  script: string;
  similarity_score: number;
  tags: string[];
}

class QdrantService {
  private client: any; // Using any temporarily
  private genAI: GoogleGenerativeAI;
  private collectionName: string;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.collectionName = process.env.QDRANT_COLLECTION_NAME || 'manim_scripts';
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      // @ts-ignore
      const { QdrantClient } = await import('@qdrant/js-client-rest');
      this.client = new QdrantClient({
        url: process.env.QDRANT_URL!,
        apiKey: process.env.QDRANT_API_KEY!,
      });
      
      await this.initializeCollection();
    } catch (error) {
      console.error('❌ Failed to initialize Qdrant client:', error);
    }
  }

  private async initializeCollection() {
    try {
      // Always force recreate to ensure correct dimensions
      console.log(`🔄 Setting up Qdrant collection: ${this.collectionName}`);
      
      try {
        // Try to delete existing collection if it exists
        await this.client.deleteCollection(this.collectionName);
        console.log(`✅ Deleted existing collection: ${this.collectionName}`);
      } catch (deleteError) {
        console.log(`ℹ️  Collection doesn't exist or couldn't be deleted (this is OK)`);
      }
      
      // Create collection with correct dimensions
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 768, // Correct dimensions for text-embedding-004
          distance: 'Cosine',
        },
      });
      
      console.log(`✅ Created Qdrant collection with 768 dimensions: ${this.collectionName}`);
      
      // Initialize with some seed data
      await this.seedCollection();
      
    } catch (error) {
      console.error('❌ Failed to initialize Qdrant collection:', error);
    }
  }

  private async seedCollection() {
    const seedData: Omit<ScriptEmbedding, 'id'>[] = [
      {
        prompt: "Create a simple circle animation",
        script: `from manim import *

class SimpleCircle(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle))
        self.wait(1)`,
        tags: ["basic", "circle", "simple"],
        complexity: "simple",
        created_at: new Date().toISOString()
      },
      {
        prompt: "Visualize the Pythagorean theorem",
        script: `from manim import *

class PythagoreanTheorem(Scene):
    def construct(self):
        # Create right triangle
        triangle = Polygon([0, 0, 0], [3, 0, 0], [3, 4, 0], color=WHITE)
        
        # Create squares on each side
        square_a = Square(side_length=3, color=RED).next_to(triangle, DOWN, buff=0)
        square_b = Square(side_length=4, color=GREEN).next_to(triangle, RIGHT, buff=0)
        square_c = Square(side_length=5, color=BLUE).move_to([1.5, 2, 0])
        
        # Labels
        label_a = MathTex("a^2").move_to(square_a.get_center())
        label_b = MathTex("b^2").move_to(square_b.get_center())
        label_c = MathTex("c^2").move_to(square_c.get_center())
        
        equation = MathTex("a^2 + b^2 = c^2").to_edge(UP)
        
        self.play(Create(triangle))
        self.play(Create(square_a), Create(square_b), Create(square_c))
        self.play(Write(label_a), Write(label_b), Write(label_c))
        self.play(Write(equation))
        self.wait(2)`,
        tags: ["geometry", "theorem", "pythagorean", "squares"],
        complexity: "medium",
        created_at: new Date().toISOString()
      }
    ];

    for (const data of seedData) {
      await this.storeScript(data);
    }
    
    console.log(`✅ Seeded ${seedData.length} scripts to Qdrant collection`);
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use text-embedding-004 which is available and stable
      const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      
      console.log(`📊 Generated embedding with ${result.embedding.values.length} dimensions`);
      
      return result.embedding.values;
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  async storeScript(scriptData: Omit<ScriptEmbedding, 'id'>): Promise<string> {
    try {
      // Generate embedding for the prompt
      const embedding = await this.generateEmbedding(scriptData.prompt);
      
      // Generate unique ID as integer timestamp + random number
      const id = Date.now() + Math.floor(Math.random() * 1000);
      
      console.log(`📝 Attempting to store script with ID: ${id}`);
      console.log(`📊 Embedding dimensions: ${embedding.length}`);
      console.log(`📋 Payload:`, {
        prompt: scriptData.prompt.substring(0, 50) + '...',
        script: scriptData.script.substring(0, 50) + '...',
        tags: scriptData.tags,
        complexity: scriptData.complexity,
        validation_score: scriptData.validation_score || 0,
        created_at: scriptData.created_at,
      });
      
      // Store in Qdrant
      const response = await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: id,
            vector: embedding,
            payload: {
              prompt: scriptData.prompt,
              script: scriptData.script,
              tags: scriptData.tags,
              complexity: scriptData.complexity,
              validation_score: scriptData.validation_score || 0,
              created_at: scriptData.created_at,
            },
          },
        ],
      });

      console.log(`✅ Stored script with ID: ${id}`, response);
      return id.toString();
    } catch (error) {
      console.error('❌ Failed to store script:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      throw error;
    }
  }

  async findSimilarScripts(prompt: string, limit: number = 3): Promise<SimilarScript[]> {
    try {
      console.log(`🔍 Searching for similar scripts to: "${prompt}"`);
      
      // Generate embedding for the search prompt
      const queryEmbedding = await this.generateEmbedding(prompt);
      
      // First, try to find scripts with high similarity score
      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: limit * 2, // Get more results to filter
        with_payload: true,
        score_threshold: 0.1, // Lower threshold to get more results
      });

      console.log(`📊 Found ${searchResult.length} potential matches`);
      
      // Convert to our format
      let results = searchResult.map((result: { id: string; payload?: { prompt: string; script: string; tags: string[] }; score: number }) => ({
        id: result.id.toString(),
        prompt: result.payload?.prompt as string,
        script: result.payload?.script as string,
        similarity_score: result.score || 0,
        tags: result.payload?.tags as string[] || [],
      }));

      // Log similarity scores for debugging
      results.forEach((result: SimilarScript) => {
        console.log(`�� "${result.prompt}" - Similarity: ${result.similarity_score.toFixed(4)}`);
      });

      // Apply text-based boost for partial matches
      const searchWords = prompt.toLowerCase().split(' ').filter(word => word.length > 2);
      
      results = results.map((result: SimilarScript) => {
        const promptWords = result.prompt.toLowerCase().split(' ');
        const matchingWords = searchWords.filter(searchWord => 
          promptWords.some(promptWord => 
            promptWord.includes(searchWord) || searchWord.includes(promptWord)
          )
        );
        
        // Boost similarity score based on word matches
        const wordMatchBoost = (matchingWords.length / searchWords.length) * 0.2;
        const boostedScore = Math.min(1.0, result.similarity_score + wordMatchBoost);
        
        return {
          ...result,
          similarity_score: boostedScore
        };
      });

      // Sort by boosted similarity score and return top results
      results.sort((a: SimilarScript, b: SimilarScript) => b.similarity_score - a.similarity_score);
      
      return results.slice(0, limit);
    } catch (error) {
      console.error('❌ Failed to find similar scripts:', error);
      return [];
    }
  }

  // Add a new method for exact text matching
  async findScriptsByTextMatch(prompt: string, limit: number = 5): Promise<SimilarScript[]> {
    try {
      // Use scroll to get all scripts and filter by text similarity
      const searchResult = await this.client.scroll(this.collectionName, {
        limit: 100, // Get more scripts to search through
        with_payload: true,
      });

      const searchWords = prompt.toLowerCase().split(' ').filter(word => word.length > 2);
      
      const results = searchResult.points
        .map((result: { id: string; payload?: { prompt: string; script: string; tags: string[] } }) => {
          const promptWords = result.payload?.prompt?.toLowerCase().split(' ') || [];
          const matchingWords = searchWords.filter(searchWord => 
            promptWords.some(promptWord => 
              promptWord.includes(searchWord) || searchWord.includes(promptWord)
            )
          );
          
          const textSimilarity = matchingWords.length / searchWords.length;
          
          return {
            id: result.id.toString(),
            prompt: result.payload?.prompt as string,
            script: result.payload?.script as string,
            similarity_score: textSimilarity,
            tags: result.payload?.tags as string[] || [],
          };
        })
        .filter((result: SimilarScript) => result.similarity_score > 0.3) // Only include results with decent text match
        .sort((a: SimilarScript, b: SimilarScript) => b.similarity_score - a.similarity_score)
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('❌ Failed to find scripts by text match:', error);
      return [];
    }
  }

  // Enhanced method that combines both approaches
  async findSimilarScriptsEnhanced(prompt: string, limit: number = 3): Promise<SimilarScript[]> {
    try {
      console.log(`🔍 Enhanced search for: "${prompt}"`);
      
      // Get results from both methods
      const [vectorResults, textResults] = await Promise.all([
        this.findSimilarScripts(prompt, limit),
        this.findScriptsByTextMatch(prompt, limit)
      ]);

      // Combine and deduplicate results
      const combinedResults = new Map<string, SimilarScript>();
      
      // Add vector results
      vectorResults.forEach(result => {
        combinedResults.set(result.id, result);
      });
      
      // Add or update with text results (giving higher weight to text matches)
      textResults.forEach(result => {
        const existing = combinedResults.get(result.id);
        if (existing) {
          // Combine scores with higher weight for text matching
          existing.similarity_score = Math.max(existing.similarity_score, result.similarity_score * 1.2);
        } else {
          combinedResults.set(result.id, {
            ...result,
            similarity_score: result.similarity_score * 1.1 // Boost text matches
          });
        }
      });

      // Sort by combined score and return top results
      const finalResults = Array.from(combinedResults.values())
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, limit);

      console.log(`✅ Enhanced search found ${finalResults.length} results`);
      finalResults.forEach(result => {
        console.log(`📈 "${result.prompt}" - Score: ${result.similarity_score.toFixed(4)}`);
      });

      return finalResults;
    } catch (error) {
      console.error('❌ Failed to find similar scripts (enhanced):', error);
      return [];
    }
  }

  async getScriptsByTags(tags: string[], limit: number = 5): Promise<SimilarScript[]> {
    try {
      const searchResult = await this.client.scroll(this.collectionName, {
        filter: {
          must: [
            {
              key: 'tags',
              match: {
                any: tags,
              },
            },
          ],
        },
        limit,
        with_payload: true,
      });

      return searchResult.points.map((result: { id: string; payload?: { prompt: string; script: string; tags: string[] }; score: number }) => ({
        id: result.id.toString(),
        prompt: result.payload?.prompt as string,
        script: result.payload?.script as string,
        similarity_score: 1.0, // Since this is exact tag match
        tags: result.payload?.tags as string[] || [],
      }));
    } catch (error) {
      console.error('❌ Failed to get scripts by tags:', error);
      return [];
    }
  }

  async getCollectionInfo() {
    try {
      const info = await this.client.getCollection(this.collectionName);
      return info;
    } catch (error) {
      console.error('❌ Failed to get collection info:', error);
      return null;
    }
  }

  async deleteScript(id: string): Promise<boolean> {
    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        points: [id],
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to delete script:', error);
      return false;
    }
  }
}

export const qdrantService = new QdrantService(); 