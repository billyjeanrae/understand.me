import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

/**
 * Generates a response from Udine, an AI conflict-resolution specialist, based on the provided conversation history and a new user message.
 *
 * @param history - The conversation history as an array of message objects with roles and content
 * @param message - The new user message to continue the conversation
 * @returns The AI-generated reply as a string
 */
export async function chatWithUdine(
	history: { role: 'user' | 'assistant'; content: string }[],
	message: string
): Promise<string> {
	const { text } = await generateText({
		model: google('gemini-2.0-flash-exp', {
			apiKey: process.env.GOOGLE_GENAI_API_KEY,
		}),
		system: `You are Udine, an AI-mediated conflict resolution specialist. Your role is to:
		- Help users navigate interpersonal disputes with empathy and understanding
		- Facilitate communication between conflicting parties
		- Provide structured guidance for conflict resolution
		- Maintain neutrality while promoting mutual understanding
		- Offer practical tools and insights for healthier interactions
		
		Keep responses conversational, supportive, and focused on resolution.`,
		messages: [...history, { role: 'user', content: message }]
	})
	return text
}
