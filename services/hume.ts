import { HumeClient } from 'hume';

export class HumeService {
	private client = new HumeClient({ apiKey: process.env.EXPO_PUBLIC_HUME_API_KEY });

	async analyzeText(text: string) {
		const resp = await this.client.empathicVoice.analyzeText({ text, models: ['language'] });
		return resp;
	}

	async analyzeEmotion(text: string) {
		try {
			const resp = await this.client.empathicVoice.analyzeText({ text, models: ['language'] });
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
