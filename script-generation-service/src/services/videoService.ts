interface VideoGenerationRequest {
  script_content: string;
  script_name?: string;
  quality?: 'low_quality' | 'medium_quality' | 'high_quality';
  format?: 'mp4' | 'mov' | 'avi';
  frame_rate?: number;
  custom_args?: Record<string, any>;
}

interface VideoJobResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  created_at: string;
  estimated_duration?: number;
}

interface VideoJobStatus {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  output_file?: string;
  file_size?: number;
}

interface VideoFile {
  filename: string;
  size: number;
  created_at: string;
  job_id: string;
}

interface VideoListResponse {
  videos: VideoFile[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class VideoServiceClient {
  private baseUrl: string;
  private timeout: number;
  private pollingInterval: number;
  private maxRetries: number;

  constructor() {
    this.baseUrl = process.env.VIDEO_SERVICE_URL || 'http://localhost:8001';
    this.timeout = parseInt(process.env.VIDEO_SERVICE_TIMEOUT || '300000'); // 5 minutes
    this.pollingInterval = parseInt(process.env.VIDEO_POLLING_INTERVAL || '5000'); // 5 seconds
    this.maxRetries = parseInt(process.env.VIDEO_MAX_RETRIES || '3');
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoJobResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/generate/script`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          script_content: request.script_content,
          script_name: request.script_name || 'generated_script',
          quality: request.quality || process.env.DEFAULT_VIDEO_QUALITY || 'medium_quality',
          format: request.format || process.env.DEFAULT_VIDEO_FORMAT || 'mp4',
          frame_rate: request.frame_rate || parseInt(process.env.DEFAULT_FRAME_RATE || '30'),
          custom_args: request.custom_args || {}
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Video generation failed: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Video generation request timed out');
      }
      throw error;
    }
  }

  async getJobStatus(jobId: string): Promise<VideoJobStatus> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for status check

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/generate/status/${jobId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get job status: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Job status request timed out');
      }
      throw error;
    }
  }

  async waitForCompletion(jobId: string, onProgress?: (status: VideoJobStatus) => void): Promise<VideoJobStatus> {
    let retries = 0;
    let lastStatus: VideoJobStatus | null = null;

    while (retries < this.maxRetries) {
      try {
        const status = await this.getJobStatus(jobId);
        lastStatus = status;

        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed') {
          return status;
        }

        if (status.status === 'failed') {
          throw new Error(`Video generation failed: ${status.error_message || 'Unknown error'}`);
        }

        if (status.status === 'pending' || status.status === 'processing') {
          await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
          continue;
        }

        break;
      } catch (error) {
        retries++;
        if (retries >= this.maxRetries) {
          throw new Error(`Failed to get job status after ${this.maxRetries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        await new Promise(resolve => setTimeout(resolve, this.pollingInterval));
      }
    }

    return lastStatus || { 
      job_id: jobId, 
      status: 'failed', 
      progress: 0, 
      message: 'Max retries exceeded',
      created_at: new Date().toISOString()
    };
  }

  async downloadVideo(jobId: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/generate/download/${jobId}`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to download video: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Video download request timed out');
      }
      throw error;
    }
  }

  async listVideos(page: number = 1, limit: number = 20): Promise<VideoListResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/files/videos?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to list videos: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('List videos request timed out');
      }
      throw error;
    }
  }

  async deleteVideo(jobId: string): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/files/videos/${jobId}`, {
        method: 'DELETE',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete video: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
      }

      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Delete video request timed out');
      }
      throw error;
    }
  }

  async checkServiceHealth(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      return false;
    }
  }
}

export const videoService = new VideoServiceClient();