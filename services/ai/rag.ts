import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../lib/supabase';
import { splitOnToken } from "../../utils/chunker";
import { DocumentEmbeddingInsert } from '../../types/database';

// Initialize Google AI for embeddings
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

// Use text-embedding-004 model for embeddings
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

/**
 * Loads a corpus of texts by splitting them into chunks and generating embeddings for each chunk.
 *
 * Each input text is divided into segments of up to 500 tokens. Embeddings for all resulting chunks are generated using Gemini's text-embedding-004 model and stored in Supabase with pgvector.
 *
 * @param texts - An array of input texts to be processed and embedded
 * @param source - Optional source identifier for the texts
 */
export async function loadCorpus(texts: string[], source?: string): Promise<void> {
  const chunks = texts.flatMap((t) => splitOnToken(t, 500));

  try {
    // Generate embeddings for all chunks using Gemini
    const embeddingPromises = chunks.map(async (chunk, index) => {
      try {
        const result = await embeddingModel.embedContent(chunk);
        const embedding = result.embedding.values;
        
        return {
          content: chunk,
          embedding: embedding,
          source: source || 'unknown',
          chunk_index: index,
          metadata: {
            token_count: chunk.split(' ').length,
            created_by: 'rag_service'
          }
        } as DocumentEmbeddingInsert;
      } catch (error) {
        console.error(`Failed to generate embedding for chunk ${index}:`, error);
        // Return null for failed chunks
        return null;
      }
    });

    const embeddingResults = await Promise.all(embeddingPromises);
    const validEmbeddings = embeddingResults.filter(result => result !== null) as DocumentEmbeddingInsert[];

    if (validEmbeddings.length === 0) {
      throw new Error('No valid embeddings generated');
    }

    // Store embeddings in Supabase
    const { error } = await supabase
      .from('document_embeddings')
      .insert(validEmbeddings);

    if (error) {
      throw new Error(`Failed to store embeddings in database: ${error.message}`);
    }

    console.log(`Successfully stored ${validEmbeddings.length} embeddings in Supabase`);
  } catch (error) {
    console.error("Failed to load corpus:", error);
    throw error;
  }
}

/**
 * Finds and returns the top most similar text chunks to a given query using Supabase pgvector similarity search.
 *
 * @param query - The input string to compare against the stored text chunks
 * @param topK - The number of most similar chunks to return (default is 3)
 * @param source - Optional source filter to search within specific sources
 * @returns An array of objects containing the most similar chunk and its similarity score, sorted in descending order by score
 */
export async function findSimilar(
  query: string,
  topK = 3,
  source?: string
): Promise<{ chunk: string; score: number; metadata?: Record<string, any> }[]> {
  try {
    // Generate embedding for the query using Gemini
    const result = await embeddingModel.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // Build the query with optional source filter
    let supabaseQuery = supabase
      .from('document_embeddings')
      .select('content, embedding, metadata, source')
      .order('embedding <-> $1', { ascending: true })
      .limit(topK);

    // Add source filter if provided
    if (source) {
      supabaseQuery = supabaseQuery.eq('source', source);
    }

    // Execute the similarity search using pgvector
    const { data, error } = await supabaseQuery.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.1, // Minimum similarity threshold
      match_count: topK
    });

    if (error) {
      console.error('Supabase similarity search error:', error);
      // Fallback to manual similarity calculation
      return await fallbackSimilaritySearch(queryEmbedding, topK, source);
    }

    if (!data || data.length === 0) {
      console.log('No similar documents found');
      return [];
    }

    // Transform results to match expected format
    return data.map((item: any) => ({
      chunk: item.content,
      score: 1 - item.distance, // Convert distance to similarity score
      metadata: item.metadata
    }));

  } catch (error) {
    console.error("Failed to find similar chunks:", error);
    return [];
  }
}

/**
 * Fallback similarity search using manual cosine similarity calculation
 */
async function fallbackSimilaritySearch(
  queryEmbedding: number[],
  topK: number,
  source?: string
): Promise<{ chunk: string; score: number; metadata?: Record<string, any> }[]> {
  try {
    // Fetch all embeddings from database
    let query = supabase
      .from('document_embeddings')
      .select('content, embedding, metadata, source');

    if (source) {
      query = query.eq('source', source);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to fetch embeddings for fallback search:', error);
      return [];
    }

    // Calculate cosine similarity for each document
    const similarities = data.map(doc => ({
      chunk: doc.content,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
      metadata: doc.metadata
    }));

    // Sort by similarity score and return top K
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

  } catch (error) {
    console.error('Fallback similarity search failed:', error);
    return [];
  }
}

/**
 * Calculates cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    console.error('Vector dimensions do not match');
    return 0;
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Clears all embeddings from the database for a specific source
 * @param source - The source identifier to clear
 */
export async function clearCorpus(source?: string): Promise<void> {
  try {
    let query = supabase.from('document_embeddings').delete();
    
    if (source) {
      query = query.eq('source', source);
    } else {
      // If no source specified, clear all
      query = query.neq('id', ''); // This will match all records
    }

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to clear corpus: ${error.message}`);
    }

    console.log(`Successfully cleared corpus${source ? ` for source: ${source}` : ''}`);
  } catch (error) {
    console.error('Failed to clear corpus:', error);
    throw error;
  }
}

/**
 * Gets statistics about the stored embeddings
 * @param source - Optional source filter
 */
export async function getCorpusStats(source?: string): Promise<{
  total_chunks: number;
  sources: string[];
  avg_chunk_length: number;
}> {
  try {
    let query = supabase
      .from('document_embeddings')
      .select('content, source');

    if (source) {
      query = query.eq('source', source);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get corpus stats: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        total_chunks: 0,
        sources: [],
        avg_chunk_length: 0
      };
    }

    const sources = [...new Set(data.map(item => item.source))];
    const avgChunkLength = data.reduce((sum, item) => sum + item.content.length, 0) / data.length;

    return {
      total_chunks: data.length,
      sources,
      avg_chunk_length: Math.round(avgChunkLength)
    };
  } catch (error) {
    console.error('Failed to get corpus stats:', error);
    return {
      total_chunks: 0,
      sources: [],
      avg_chunk_length: 0
    };
  }
}

/**
 * Updates an existing document embedding
 * @param id - The ID of the embedding to update
 * @param content - New content
 * @param source - Optional new source
 */
export async function updateEmbedding(
  id: string,
  content: string,
  source?: string
): Promise<void> {
  try {
    // Generate new embedding for the updated content
    const result = await embeddingModel.embedContent(content);
    const embedding = result.embedding.values;

    const updateData: any = {
      content,
      embedding,
      updated_at: new Date().toISOString(),
      metadata: {
        token_count: content.split(' ').length,
        updated_by: 'rag_service'
      }
    };

    if (source) {
      updateData.source = source;
    }

    const { error } = await supabase
      .from('document_embeddings')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update embedding: ${error.message}`);
    }

    console.log(`Successfully updated embedding with ID: ${id}`);
  } catch (error) {
    console.error('Failed to update embedding:', error);
    throw error;
  }
}
