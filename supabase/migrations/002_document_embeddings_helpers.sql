-- Helper queries for managing document embeddings
-- These are utility queries you can run manually in Supabase SQL Editor

-- 1. Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 2. View embedding statistics by source
SELECT * FROM public.embedding_stats ORDER BY total_chunks DESC;

-- 3. Get total embeddings count
SELECT COUNT(*) as total_embeddings FROM public.document_embeddings;

-- 4. View recent embeddings
SELECT 
    id,
    LEFT(content, 100) || '...' as content_preview,
    source,
    chunk_index,
    created_at
FROM public.document_embeddings 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Test similarity search function
-- Replace the array with actual embedding values when testing
/*
SELECT * FROM match_documents(
    query_embedding := '[0.1, 0.2, 0.3, ...]'::vector, -- Replace with actual 768-dim vector
    match_threshold := 0.1,
    match_count := 5,
    filter_source := 'knowledge_base' -- Optional: filter by source
);
*/

-- 6. Clear all embeddings (use with caution!)
-- DELETE FROM public.document_embeddings;

-- 7. Clear embeddings by source
-- DELETE FROM public.document_embeddings WHERE source = 'your_source_name';

-- 8. Update embedding metadata
/*
UPDATE public.document_embeddings 
SET metadata = metadata || '{"updated_by": "admin", "version": "2.0"}'::jsonb
WHERE source = 'knowledge_base';
*/

-- 9. Find embeddings with specific metadata
/*
SELECT id, content, metadata, source 
FROM public.document_embeddings 
WHERE metadata->>'created_by' = 'rag_service';
*/

-- 10. Check index usage and performance
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'document_embeddings';

-- 11. Monitor table size and growth
SELECT 
    pg_size_pretty(pg_total_relation_size('public.document_embeddings')) as total_size,
    pg_size_pretty(pg_relation_size('public.document_embeddings')) as table_size,
    pg_size_pretty(pg_total_relation_size('public.document_embeddings') - pg_relation_size('public.document_embeddings')) as index_size;

-- 12. Vacuum and analyze for performance (run periodically)
-- VACUUM ANALYZE public.document_embeddings;

