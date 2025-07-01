import { HumeClient } from 'hume';

export class HumeService {
	private client = new HumeClient({ apiKey: process.env.EXPO_PUBLIC_HUME_API_KEY });

	async analyzeText(text: string) {
		try {
			// Use the expression measurement API for text analysis
			const resp = await this.client.expressionMeasurement.batch.startInferenceJob({
				models: {
					language: {}
				},
				text: [text]
			});
			return resp;
		} catch (error) {
			console.error('Error analyzing text:', error);
			return null;
		}
	}

	async analyzeEmotion(text: string) {
		try {
			// Use the expression measurement API for emotion analysis
			const resp = await this.client.expressionMeasurement.batch.startInferenceJob({
				models: {
					language: {}
				},
				text: [text]
			});
			return resp;
		} catch (error) {
			console.error('Error analyzing emotion:', error);
			return null;
		}
	}
}

// Export a default instance and the analyzeEmotion function
const humeService = new HumeService();
export default humeService;
export const analyzeEmotion = (text: string) => humeService.analyzeEmotion(text);
