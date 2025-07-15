import { videoService } from './src/services/videoService';

console.log('Testing video service integration...');

async function testVideoServiceIntegration() {
  try {
    // Test 1: Check video service health
    console.log('\n1. Testing video service health...');
    const isHealthy = await videoService.checkServiceHealth();
    console.log(`Video service health: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    
    if (!isHealthy) {
      console.log('⚠️  Video service is not responding. Please ensure it is running on http://localhost:8001');
      return;
    }

    // Test 2: Generate a simple test video
    console.log('\n2. Testing video generation...');
    const testScript = `
from manim import *

class TestCircle(Scene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle))
        self.wait(1)
`;

    const videoJob = await videoService.generateVideo({
      script_content: testScript,
      script_name: 'test_integration',
      quality: 'low_quality',
      format: 'mp4',
      frame_rate: 15
    });

    console.log('Video job created:', videoJob);

    // Test 3: Poll for completion
    console.log('\n3. Testing job status polling...');
    const finalStatus = await videoService.waitForCompletion(videoJob.job_id, (status) => {
      console.log(`Progress: ${status.progress}% - ${status.message}`);
    });

    console.log('Final status:', finalStatus);

    if (finalStatus.status === 'completed') {
      console.log('✅ Video generation completed successfully!');
      
      // Test 4: List videos
      console.log('\n4. Testing video listing...');
      const videos = await videoService.listVideos(1, 5);
      console.log('Videos:', videos);
      
      console.log('\n✅ All integration tests passed!');
    } else {
      console.log('❌ Video generation failed:', finalStatus.error_message);
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Run the test
testVideoServiceIntegration();