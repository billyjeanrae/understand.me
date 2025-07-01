import { HumeClient } from 'hume';

export interface EmotionPrediction {
  name: string;
  score: number;
}

export interface HumeAnalysisResult {
  jobId: string;
  predictions?: EmotionPrediction[];
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  error?: string;
}

export interface AudioAnalysisOptions {
  includeProsody?: boolean;
  includeVocalBurst?: boolean;
  includeFacialExpression?: boolean;
}

export class HumeService {
  private client = new HumeClient({ apiKey: process.env.EXPO_PUBLIC_HUME_API_KEY });

  /**
   * Start a batch inference job for text analysis
   */
  async analyzeText(text: string): Promise<HumeAnalysisResult> {
    try {
      const response = await this.client.expressionMeasurement.batch.startInferenceJob({
        models: {
          language: {}
        },
        text: [text]
      });

      return {
        jobId: response.jobId,
        status: 'queued'
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      return {
        jobId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Start a batch inference job for audio analysis
   */
  async analyzeAudio(audioUri: string, options: AudioAnalysisOptions = {}): Promise<HumeAnalysisResult> {
    try {
      const models: any = {};
      
      if (options.includeProsody !== false) {
        models.prosody = {};
      }
      
      if (options.includeVocalBurst) {
        models.burst = {};
      }
      
      if (options.includeFacialExpression) {
        models.face = {};
      }

      // For audio files, we need to upload them
      const response = await this.client.expressionMeasurement.batch.startInferenceJobFromLocalFile({
        models,
        file: audioUri
      });

      return {
        jobId: response.jobId,
        status: 'queued'
      };
    } catch (error) {
      console.error('Error analyzing audio:', error);
      return {
        jobId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the status and results of a batch job
   */
  async getJobResults(jobId: string): Promise<HumeAnalysisResult> {
    try {
      const jobDetails = await this.client.expressionMeasurement.batch.getJobDetails(jobId);
      
      if (jobDetails.state.status === 'COMPLETED') {
        const predictions = await this.client.expressionMeasurement.batch.getJobPredictions(jobId);
        
        // Extract emotion predictions from the response
        const emotionPredictions = this.extractEmotionPredictions(predictions);
        
        return {
          jobId,
          status: 'completed',
          predictions: emotionPredictions
        };
      }

      return {
        jobId,
        status: jobDetails.state.status.toLowerCase() as any
      };
    } catch (error) {
      console.error('Error getting job results:', error);
      return {
        jobId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * List all batch jobs
   */
  async listJobs(limit: number = 10) {
    try {
      return await this.client.expressionMeasurement.batch.listJobs({ limit });
    } catch (error) {
      console.error('Error listing jobs:', error);
      return null;
    }
  }

  /**
   * Convenience method for emotion analysis (backwards compatibility)
   */
  async analyzeEmotion(text: string): Promise<HumeAnalysisResult> {
    return this.analyzeText(text);
  }

  /**
   * Poll for job completion and return results
   */
  async waitForJobCompletion(jobId: string, maxWaitTime: number = 60000): Promise<HumeAnalysisResult> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getJobResults(jobId);
      
      if (result.status === 'completed' || result.status === 'failed') {
        return result;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    return {
      jobId,
      status: 'failed',
      error: 'Job timed out'
    };
  }

  /**
   * Extract emotion predictions from Hume API response
   */
  private extractEmotionPredictions(predictions: any): EmotionPrediction[] {
    try {
      const results: EmotionPrediction[] = [];
      
      // Navigate through the prediction structure
      if (predictions && predictions.length > 0) {
        const firstPrediction = predictions[0];
        
        // Check for language model predictions
        if (firstPrediction.results?.predictions?.length > 0) {
          const languagePredictions = firstPrediction.results.predictions[0];
          
          if (languagePredictions.models?.language?.groupedPredictions?.length > 0) {
            const emotions = languagePredictions.models.language.groupedPredictions[0].predictions;
            
            emotions.forEach((emotion: any) => {
              results.push({
                name: emotion.name,
                score: emotion.score
              });
            });
          }
        }
        
        // Check for prosody predictions
        if (firstPrediction.results?.predictions?.length > 0) {
          const prosodyPredictions = firstPrediction.results.predictions[0];
          
          if (prosodyPredictions.models?.prosody?.groupedPredictions?.length > 0) {
            const emotions = prosodyPredictions.models.prosody.groupedPredictions[0].predictions;
            
            emotions.forEach((emotion: any) => {
              results.push({
                name: `prosody_${emotion.name}`,
                score: emotion.score
              });
            });
          }
        }
      }
      
      // Sort by score descending
      return results.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error extracting emotion predictions:', error);
      return [];
    }
  }
}

// Export a default instance and the analyzeEmotion function
const humeService = new HumeService();
export default humeService;
export const analyzeEmotion = (text: string) => humeService.analyzeEmotion(text);
