// Test script for OpenRouter integration
import { config } from 'dotenv';
config();
import { promises as fs } from 'fs';
import path from 'path';

async function testOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY not found in environment variables');
    console.log('Please set OPENROUTER_API_KEY in your .env file');
    return;
  }

  console.log('🧪 Testing OpenRouter API with DeepSeek V3...\n');

  const testPrompts = [
    "Create a simple circle animation that grows and shrinks",
    "Visualize the Pythagorean theorem with animated squares",
    "Show a sine wave being traced by a moving point on a circle"
  ];

  for (const prompt of testPrompts) {
    console.log(`📝 Testing prompt: "${prompt}"`);
    console.log('─'.repeat(50));

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/math-video-generation',
          'X-Title': 'Math Video Generation Test'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in Manim. Generate a simple, working Manim script. Return ONLY Python code, no explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ API Error (${response.status}): ${error}`);
        continue;
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        console.log('✅ Response received successfully!');
        console.log('\n📄 Generated script preview:');
        const script = data.choices[0].message.content;
        console.log(script.substring(0, 200) + '...\n');
        
        // Save the script to /test-manim-scripts
        const TEST_SCRIPTS_DIR = path.join(process.cwd(), 'script-generation-service', 'test-manim-scripts');
        try {
          await fs.mkdir(TEST_SCRIPTS_DIR, { recursive: true });
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const sanitizedPrompt = prompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30);
          const filename = `${sanitizedPrompt}_${timestamp}.py`;
          const filepath = path.join(TEST_SCRIPTS_DIR, filename);
          await fs.writeFile(filepath, script, 'utf8');
          console.log(`💾 Script saved to: ${filepath}`);
        } catch (fileErr) {
          console.error('❌ Failed to save script:', fileErr);
        }
        
        // Check if it looks like a valid Manim script
        const hasImport = script.includes('from manim import') || script.includes('import manim');
        const hasClass = script.includes('class') && script.includes('Scene');
        const hasConstruct = script.includes('def construct');
        
        console.log('Validation:');
        console.log(`  - Has Manim import: ${hasImport ? '✅' : '❌'}`);
        console.log(`  - Has Scene class: ${hasClass ? '✅' : '❌'}`);
        console.log(`  - Has construct method: ${hasConstruct ? '✅' : '❌'}`);
      }
      
      if (data.usage) {
        console.log('\n📊 Token usage:', data.usage);
      }

    } catch (error) {
      console.error('❌ Error:', error);
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }

  // Test the local API endpoint
  console.log('🔌 Testing local API integration...');
  try {
    const localResponse = await fetch('http://localhost:5000/api/provider-info');
    if (localResponse.ok) {
      const info = await localResponse.json();
      console.log('✅ Local API is running');
      console.log('Provider info:', info);
    } else {
      console.log('❌ Local API is not running. Start it with: bun run dev');
    }
  } catch (error) {
    console.log('❌ Could not connect to local API. Make sure the service is running.');
  }
}

// Run the test
testOpenRouter().catch(console.error);