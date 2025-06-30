# Supabase Database Requirements for understand.me

This document outlines the Supabase database schema and configuration needed for the understand.me conflict resolution platform.

## 🗄️ **Database Schema**

### **Core Tables**

#### **1. Users Table**
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Profile information
  communication_style TEXT CHECK (communication_style IN ('supportive', 'direct', 'analytical', 'empathetic')),
  conflict_preferences JSONB DEFAULT '{}',
  skill_levels JSONB DEFAULT '{}',
  personalization_data JSONB DEFAULT '{}',
  
  -- Analytics
  total_sessions INTEGER DEFAULT 0,
  resolution_rate DECIMAL(5,2) DEFAULT 0.0,
  last_session_at TIMESTAMP WITH TIME ZONE
);
```

#### **2. Conversations Table**
```sql
-- Conversations/Sessions table
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  conflict_type TEXT CHECK (conflict_type IN ('interpersonal', 'family', 'workplace', 'neighbor', 'other')),
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'cancelled')) DEFAULT 'active',
  session_phase TEXT CHECK (session_phase IN ('opening', 'exploration', 'negotiation', 'resolution', 'closing')) DEFAULT 'opening',
  
  -- Participants
  created_by UUID REFERENCES public.users(id) NOT NULL,
  participants UUID[] DEFAULT '{}',
  facilitator_id UUID REFERENCES public.users(id),
  
  -- Session data
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 0,
  
  -- Outcomes
  resolution_achieved BOOLEAN DEFAULT FALSE,
  satisfaction_rating DECIMAL(3,2),
  follow_up_required BOOLEAN DEFAULT FALSE,
  next_steps TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **3. Messages Table**
```sql
-- Messages in conversations
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id),
  sender_type TEXT CHECK (sender_type IN ('user', 'ai', 'system')) DEFAULT 'user',
  
  -- Message content
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'audio', 'document', 'system')) DEFAULT 'text',
  audio_url TEXT,
  document_url TEXT,
  
  -- AI Analysis
  emotion_analysis JSONB,
  conflict_analysis JSONB,
  ai_recommendations TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **4. Documents Table**
```sql
-- Documents uploaded to conversations
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.users(id),
  
  -- File information
  filename TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  
  -- Analysis results
  document_analysis JSONB,
  conflict_relevance INTEGER CHECK (conflict_relevance >= 0 AND conflict_relevance <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Analytics Tables**

#### **5. Emotion Analytics Table**
```sql
-- Emotion analysis data
CREATE TABLE public.emotion_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  
  -- Hume Expression Measurement data
  emotions JSONB NOT NULL, -- Array of emotion scores
  dominant_emotion TEXT,
  emotional_state TEXT CHECK (emotional_state IN ('positive', 'negative', 'neutral', 'mixed')),
  conflict_level INTEGER CHECK (conflict_level >= 0 AND conflict_level <= 100),
  resolution_potential INTEGER CHECK (resolution_potential >= 0 AND resolution_potential <= 100),
  
  -- Context
  source TEXT CHECK (source IN ('text', 'audio', 'video')) DEFAULT 'text',
  session_phase TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **6. Conversation Analytics Table**
```sql
-- Conversation-level analytics
CREATE TABLE public.conversation_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  
  -- Session metrics
  duration_minutes INTEGER,
  message_count INTEGER,
  average_message_length DECIMAL(8,2),
  response_time_avg DECIMAL(8,2),
  
  -- Emotional journey
  emotional_journey JSONB, -- Array of emotion data points
  emotional_stability DECIMAL(5,2),
  breakthrough_moments JSONB DEFAULT '[]',
  challenging_moments JSONB DEFAULT '[]',
  
  -- Communication patterns
  communication_effectiveness JSONB,
  skills_used TEXT[],
  skill_effectiveness JSONB,
  
  -- Resolution tracking
  resolution_progress JSONB,
  key_insights TEXT[],
  recommended_actions TEXT[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔍 **pgvector Integration for Semantic Search**

### **Enable pgvector Extension**
```sql
-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### **Vector Embeddings Tables**

#### **7. Message Embeddings Table**
```sql
-- Vector embeddings for semantic search
CREATE TABLE public.message_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Vector embedding (1536 dimensions for OpenAI embeddings)
  embedding vector(1536) NOT NULL,
  
  -- Metadata for search
  content_preview TEXT, -- First 200 chars of message
  conflict_type TEXT,
  emotional_state TEXT,
  session_phase TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON public.message_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### **8. Document Embeddings Table**
```sql
-- Vector embeddings for document search
CREATE TABLE public.document_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Vector embedding
  embedding vector(1536) NOT NULL,
  
  -- Chunk information (for large documents)
  chunk_index INTEGER DEFAULT 0,
  chunk_content TEXT,
  
  -- Metadata
  document_type TEXT,
  conflict_relevance INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for document vector search
CREATE INDEX ON public.document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### **Semantic Search Functions**

#### **Similar Messages Search**
```sql
-- Function to find similar messages
CREATE OR REPLACE FUNCTION find_similar_messages(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 10,
  filter_conversation_id uuid DEFAULT NULL
)
RETURNS TABLE (
  message_id uuid,
  conversation_id uuid,
  content_preview text,
  similarity float,
  conflict_type text,
  emotional_state text
)
LANGUAGE sql
AS $$
  SELECT 
    me.message_id,
    me.conversation_id,
    me.content_preview,
    1 - (me.embedding <=> query_embedding) as similarity,
    me.conflict_type,
    me.emotional_state
  FROM public.message_embeddings me
  WHERE 
    (filter_conversation_id IS NULL OR me.conversation_id = filter_conversation_id)
    AND 1 - (me.embedding <=> query_embedding) > match_threshold
  ORDER BY me.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

#### **Similar Documents Search**
```sql
-- Function to find similar documents
CREATE OR REPLACE FUNCTION find_similar_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  document_id uuid,
  conversation_id uuid,
  chunk_content text,
  similarity float,
  document_type text,
  conflict_relevance integer
)
LANGUAGE sql
AS $$
  SELECT 
    de.document_id,
    de.conversation_id,
    de.chunk_content,
    1 - (de.embedding <=> query_embedding) as similarity,
    de.document_type,
    de.conflict_relevance
  FROM public.document_embeddings de
  WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

## 🔐 **Row Level Security (RLS)**

### **Enable RLS on all tables**
```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
```

### **RLS Policies**

#### **Users Table Policies**
```sql
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

#### **Conversations Table Policies**
```sql
-- Users can view conversations they're part of
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(participants) OR 
    auth.uid() = facilitator_id
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update conversations they created
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = created_by);
```

#### **Messages Table Policies**
```sql
-- Users can view messages in conversations they're part of
CREATE POLICY "Users can view conversation messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
      AND (
        auth.uid() = c.created_by OR 
        auth.uid() = ANY(c.participants) OR 
        auth.uid() = c.facilitator_id
      )
    )
  );

-- Users can insert messages in conversations they're part of
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = conversation_id 
      AND (
        auth.uid() = c.created_by OR 
        auth.uid() = ANY(c.participants) OR 
        auth.uid() = c.facilitator_id
      )
    )
  );
```

## 📊 **Indexes for Performance**

```sql
-- Conversation indexes
CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversations_status ON public.conversations(status);
CREATE INDEX idx_conversations_conflict_type ON public.conversations(conflict_type);
CREATE INDEX idx_conversations_participants ON public.conversations USING GIN(participants);

-- Message indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_message_type ON public.messages(message_type);

-- Analytics indexes
CREATE INDEX idx_emotion_analytics_conversation_id ON public.emotion_analytics(conversation_id);
CREATE INDEX idx_emotion_analytics_user_id ON public.emotion_analytics(user_id);
CREATE INDEX idx_emotion_analytics_created_at ON public.emotion_analytics(created_at);

-- Vector search indexes (already created above)
-- CREATE INDEX ON public.message_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX ON public.document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## 🔧 **Triggers and Functions**

### **Update Timestamps**
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🌐 **Environment Variables Required**

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# For server-side operations (if needed)
SUPABASE_JWT_SECRET=your_jwt_secret
```

## 📝 **Usage Examples**

### **TypeScript Types**
```typescript
// Database types (generate with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          communication_style: 'supportive' | 'direct' | 'analytical' | 'empathetic' | null;
          // ... other fields
        };
        Insert: {
          id: string;
          email: string;
          // ... other fields
        };
        Update: {
          id?: string;
          email?: string;
          // ... other fields
        };
      };
      // ... other tables
    };
  };
}
```

### **Vector Search Usage**
```typescript
// Example: Find similar messages for context
const { data: similarMessages } = await supabase.rpc('find_similar_messages', {
  query_embedding: messageEmbedding,
  match_threshold: 0.8,
  match_count: 5,
  filter_conversation_id: currentConversationId
});

// Example: Find relevant documents
const { data: relevantDocs } = await supabase.rpc('find_similar_documents', {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 3
});
```

## 🚀 **Setup Instructions**

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Enable pgvector**
   - Go to Database > Extensions
   - Enable the `vector` extension

3. **Run SQL Scripts**
   - Copy and run all the SQL scripts above in the SQL editor
   - Run them in order: tables, indexes, functions, policies

4. **Configure Environment**
   - Add the environment variables to your `.env` file
   - Update your Supabase client configuration

5. **Generate Types**
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
   ```

This schema provides a robust foundation for the understand.me platform with advanced features like semantic search, comprehensive analytics, and proper security policies.
