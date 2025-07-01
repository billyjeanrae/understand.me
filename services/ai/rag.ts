import { VoyageAIClient } from 'voyageai';
import { splitOnToken } from '../../utils/chunker';

let embeddings: number[][] = [];
let chunks: string[] = [];

const voyageClient = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY || ''
});

/**
 * Loads a corpus of texts by splitting them into chunks and generating embeddings for each chunk.
 *
 * Each input text is divided into segments of up to 500 tokens. Embeddings for all resulting chunks are generated using the 'voyage-embed' model and stored for later similarity search.
 *
 * @param texts - An array of input texts to be processed and embedded
 */
export async function loadCorpus(texts: string[]): Promise<void> {
	chunks = texts.flatMap(t => splitOnToken(t, 500));
	
	try {
		const response = await voyageClient.embed({
			input: chunks,
			model: 'voyage-2'
		});
		embeddings = response.data.map(item => item.embedding);
	} catch (error) {
		console.error('Error generating embeddings:', error);
		embeddings = [];
	}
}

/**
 * Calculates cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
	const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
	const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
	const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Finds and returns the top most similar text chunks to a given query based on vector embeddings.
 *
 * @param query - The input string to compare against the loaded text chunks
 * @param topK - The number of most similar chunks to return (default is 3)
 * @returns An array of objects containing the most similar chunk and its similarity score, sorted in descending order by score
 */
export async function findSimilar(query: string, topK = 3): Promise<{ chunk: string; score: number }[]> {
	try {
		const response = await voyageClient.embed({
			input: [query],
			model: 'voyage-2'
		});
		const qEmb = response.data[0].embedding;
		
		return chunks
			.map((c, i) => ({ chunk: c, score: cosineSimilarity(qEmb, embeddings[i]) }))
			.sort((a, b) => b.score - a.score)
			.slice(0, topK);
	} catch (error) {
		console.error('Error finding similar chunks:', error);
		return [];
	}
}
