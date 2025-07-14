// Test script to verify the service is working without Qdrant

async function testService() {
  console.log('🧪 Testing Math Video Generator Service...\n');

  const baseUrl = 'http://localhost:5000';

  // Test 1: Check if service is running
  console.log('1️⃣ Testing service health...');
  try {
    const healthResponse = await fetch(`${baseUrl}/`);
    const healthData = await healthResponse.json();
    console.log('✅ Service is running');
    console.log('   Provider:', healthData.llmProvider);
    console.log('   Status:', healthData.status);
  } catch (error) {
    console.error('❌ Service is not running. Start it with: bun run dev');
    return;
  }

  // Test 2: Check provider info
  console.log('\n2️⃣ Testing provider configuration...');
  try {
    const providerResponse = await fetch(`${baseUrl}/api/provider-info`);
    const providerData = await providerResponse.json();
    console.log('✅ Provider info retrieved');
    console.log('   Current:', providerData.currentProvider);
    console.log('   Available:', providerData.availableProviders);
  } catch (error) {
    console.error('❌ Failed to get provider info:', error);
  }

  // Test 3: Generate a simple Manim script
  console.log('\n3️⃣ Testing script generation...');
  try {
    const generateResponse = await fetch(`${baseUrl}/api/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Create a simple animated circle that changes color from blue to red",
        saveToFile: false
      })
    });

    const generateData = await generateResponse.json();
    
    if (generateData.success) {
      console.log('✅ Script generated successfully!');
      console.log('   Validation:', generateData.validation.isValid ? 'Valid' : 'Invalid');
      if (generateData.validation.warnings.length > 0) {
        console.log('   Warnings:', generateData.validation.warnings);
      }
      console.log('\n📄 Generated script preview:');
      console.log(generateData.script.substring(0, 200) + '...');
    } else {
      console.error('❌ Failed to generate script:', generateData.error);
    }
  } catch (error) {
    console.error('❌ Script generation error:', error);
  }

  // Test 4: Check Qdrant status
  console.log('\n4️⃣ Testing vector database status...');
  try {
    const qdrantResponse = await fetch(`${baseUrl}/api/vector-db-status`);
    const qdrantData = await qdrantResponse.json();
    
    if (qdrantData.status === 'disconnected') {
      console.log('⚠️  Qdrant is not available (this is expected)');
      console.log('   The service works without it for basic generation');
    } else {
      console.log('✅ Qdrant is connected');
    }
  } catch (error) {
    console.error('❌ Failed to check Qdrant status:', error);
  }

  // Test 5: Test enhanced generation (should work without Qdrant)
  console.log('\n5️⃣ Testing enhanced generation without Qdrant...');
  try {
    const enhancedResponse = await fetch(`${baseUrl}/api/generate-script-enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Show a sine wave animation",
        useRAG: true,
        saveToFile: false
      })
    });

    const enhancedData = await enhancedResponse.json();
    
    if (enhancedData.success) {
      console.log('✅ Enhanced generation works without Qdrant');
      console.log('   Context used:', enhancedData.context_used);
      console.log('   Similar scripts found:', enhancedData.similar_scripts.length);
    } else {
      console.error('❌ Enhanced generation failed:', enhancedData.error);
    }
  } catch (error) {
    console.error('❌ Enhanced generation error:', error);
  }

  console.log('\n✨ Testing complete!');
}

// Run the test
testService().catch(console.error);