/**
 * Database Types for understand.me
 * Comprehensive type definitions for Supabase integration
 */

export interface Database {
  public: {
    Tables: {
      // User Profiles
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          
          // Onboarding Data
          onboarding_completed: boolean;
          voice_onboarding_completed: boolean;
          personality_assessment_completed: boolean;
          
          // Personality Profile
          communication_style: 'direct' | 'diplomatic' | 'analytical' | 'empathetic' | null;
          conflict_style: 'competitive' | 'collaborative' | 'accommodating' | 'avoiding' | 'compromising' | null;
          emotional_intelligence: number | null;
          personality_traits: string[] | null;
          personality_recommendations: string[] | null;
          
          // Preferences
          voice_enabled: boolean;
          preferred_language: string;
          timezone: string | null;
          notification_preferences: Record<string, any> | null;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          onboarding_completed?: boolean;
          voice_onboarding_completed?: boolean;
          personality_assessment_completed?: boolean;
          communication_style?: 'direct' | 'diplomatic' | 'analytical' | 'empathetic' | null;
          conflict_style?: 'competitive' | 'collaborative' | 'accommodating' | 'avoiding' | 'compromising' | null;
          emotional_intelligence?: number | null;
          personality_traits?: string[] | null;
          personality_recommendations?: string[] | null;
          voice_enabled?: boolean;
          preferred_language?: string;
          timezone?: string | null;
          notification_preferences?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
          onboarding_completed?: boolean;
          voice_onboarding_completed?: boolean;
          personality_assessment_completed?: boolean;
          communication_style?: 'direct' | 'diplomatic' | 'analytical' | 'empathetic' | null;
          conflict_style?: 'competitive' | 'collaborative' | 'accommodating' | 'avoiding' | 'compromising' | null;
          emotional_intelligence?: number | null;
          personality_traits?: string[] | null;
          personality_recommendations?: string[] | null;
          voice_enabled?: boolean;
          preferred_language?: string;
          timezone?: string | null;
          notification_preferences?: Record<string, any> | null;
        };
      };

      // Conflict Sessions
      conflict_sessions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          
          // Session Details
          title: string;
          description: string;
          status: 'pending' | 'active' | 'paused' | 'resolved' | 'escalated';
          session_type: 'onboarding' | 'conflict-resolution' | 'personality-assessment' | 'practice';
          
          // Participants
          creator_id: string;
          participant_ids: string[];
          mediator_type: 'ai' | 'human' | 'hybrid';
          
          // Session Data
          conflict_level: number;
          resolution_potential: number;
          session_phase: 'opening' | 'exploration' | 'negotiation' | 'resolution' | 'closing';
          
          // Timing
          started_at: string | null;
          ended_at: string | null;
          duration_minutes: number | null;
          
          // Results
          resolution_achieved: boolean;
          satisfaction_scores: Record<string, number> | null;
          follow_up_scheduled: boolean;
          
          // Metadata
          tags: string[] | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description: string;
          status?: 'pending' | 'active' | 'paused' | 'resolved' | 'escalated';
          session_type: 'onboarding' | 'conflict-resolution' | 'personality-assessment' | 'practice';
          creator_id: string;
          participant_ids: string[];
          mediator_type?: 'ai' | 'human' | 'hybrid';
          conflict_level?: number;
          resolution_potential?: number;
          session_phase?: 'opening' | 'exploration' | 'negotiation' | 'resolution' | 'closing';
          started_at?: string | null;
          ended_at?: string | null;
          duration_minutes?: number | null;
          resolution_achieved?: boolean;
          satisfaction_scores?: Record<string, number> | null;
          follow_up_scheduled?: boolean;
          tags?: string[] | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string;
          title?: string;
          description?: string;
          status?: 'pending' | 'active' | 'paused' | 'resolved' | 'escalated';
          session_type?: 'onboarding' | 'conflict-resolution' | 'personality-assessment' | 'practice';
          participant_ids?: string[];
          mediator_type?: 'ai' | 'human' | 'hybrid';
          conflict_level?: number;
          resolution_potential?: number;
          session_phase?: 'opening' | 'exploration' | 'negotiation' | 'resolution' | 'closing';
          started_at?: string | null;
          ended_at?: string | null;
          duration_minutes?: number | null;
          resolution_achieved?: boolean;
          satisfaction_scores?: Record<string, number> | null;
          follow_up_scheduled?: boolean;
          tags?: string[] | null;
          notes?: string | null;
        };
      };

      // Conversation Messages
      conversation_messages: {
        Row: {
          id: string;
          session_id: string;
          sender_id: string;
          sender_type: 'user' | 'ai' | 'mediator';
          
          // Message Content
          content: string;
          message_type: 'text' | 'audio' | 'system' | 'tool_call' | 'emotion_analysis';
          
          // Audio Data
          audio_url: string | null;
          audio_duration: number | null;
          transcription: string | null;
          
          // Emotion Analysis
          emotion_data: Record<string, any> | null;
          conflict_level: number | null;
          
          // AI Data
          ai_confidence: number | null;
          tool_calls: Record<string, any>[] | null;
          
          // Timestamps
          created_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          sender_id: string;
          sender_type: 'user' | 'ai' | 'mediator';
          content: string;
          message_type?: 'text' | 'audio' | 'system' | 'tool_call' | 'emotion_analysis';
          audio_url?: string | null;
          audio_duration?: number | null;
          transcription?: string | null;
          emotion_data?: Record<string, any> | null;
          conflict_level?: number | null;
          ai_confidence?: number | null;
          tool_calls?: Record<string, any>[] | null;
          created_at?: string;
          processed_at?: string | null;
        };
        Update: {
          content?: string;
          audio_url?: string | null;
          audio_duration?: number | null;
          transcription?: string | null;
          emotion_data?: Record<string, any> | null;
          conflict_level?: number | null;
          ai_confidence?: number | null;
          tool_calls?: Record<string, any>[] | null;
          processed_at?: string | null;
        };
      };

      // Emotion Analysis Records
      emotion_analyses: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          
          // Analysis Data
          analysis_type: 'voice' | 'text' | 'facial' | 'combined';
          raw_data: Record<string, any>;
          processed_data: Record<string, any>;
          
          // Metrics
          conflict_level: number;
          resolution_potential: number;
          emotional_state: string;
          dominant_emotions: string[];
          
          // Context
          session_phase: string;
          trigger_event: string | null;
          
          // Timestamps
          created_at: string;
          analyzed_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          analysis_type: 'voice' | 'text' | 'facial' | 'combined';
          raw_data: Record<string, any>;
          processed_data: Record<string, any>;
          conflict_level: number;
          resolution_potential: number;
          emotional_state: string;
          dominant_emotions: string[];
          session_phase: string;
          trigger_event?: string | null;
          created_at?: string;
          analyzed_at?: string;
        };
        Update: {
          processed_data?: Record<string, any>;
          conflict_level?: number;
          resolution_potential?: number;
          emotional_state?: string;
          dominant_emotions?: string[];
          session_phase?: string;
          trigger_event?: string | null;
          analyzed_at?: string;
        };
      };

      // AI Insights and Recommendations
      ai_insights: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          
          // Insight Data
          insight_type: 'recommendation' | 'pattern' | 'warning' | 'opportunity' | 'summary';
          title: string;
          content: string;
          confidence_score: number;
          
          // Context
          trigger_data: Record<string, any> | null;
          related_emotions: string[] | null;
          session_phase: string;
          
          // Actions
          suggested_actions: string[] | null;
          implemented: boolean;
          effectiveness_score: number | null;
          
          // Timestamps
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          insight_type: 'recommendation' | 'pattern' | 'warning' | 'opportunity' | 'summary';
          title: string;
          content: string;
          confidence_score: number;
          trigger_data?: Record<string, any> | null;
          related_emotions?: string[] | null;
          session_phase: string;
          suggested_actions?: string[] | null;
          implemented?: boolean;
          effectiveness_score?: number | null;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          title?: string;
          content?: string;
          confidence_score?: number;
          trigger_data?: Record<string, any> | null;
          related_emotions?: string[] | null;
          session_phase?: string;
          suggested_actions?: string[] | null;
          implemented?: boolean;
          effectiveness_score?: number | null;
          expires_at?: string | null;
        };
      };

      // User Analytics and Progress
      user_analytics: {
        Row: {
          id: string;
          user_id: string;
          
          // Session Stats
          total_sessions: number;
          resolved_sessions: number;
          average_session_duration: number;
          
          // Skill Development
          communication_improvement: number;
          emotional_regulation_score: number;
          conflict_resolution_success_rate: number;
          
          // Engagement
          voice_usage_percentage: number;
          ai_interaction_count: number;
          last_active_at: string;
          
          // Achievements
          achievements_unlocked: string[] | null;
          current_streak: number;
          longest_streak: number;
          
          // Timestamps
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_sessions?: number;
          resolved_sessions?: number;
          average_session_duration?: number;
          communication_improvement?: number;
          emotional_regulation_score?: number;
          conflict_resolution_success_rate?: number;
          voice_usage_percentage?: number;
          ai_interaction_count?: number;
          last_active_at?: string;
          achievements_unlocked?: string[] | null;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          total_sessions?: number;
          resolved_sessions?: number;
          average_session_duration?: number;
          communication_improvement?: number;
          emotional_regulation_score?: number;
          conflict_resolution_success_rate?: number;
          voice_usage_percentage?: number;
          ai_interaction_count?: number;
          last_active_at?: string;
          achievements_unlocked?: string[] | null;
          current_streak?: number;
          longest_streak?: number;
          updated_at?: string;
        };
      };

      // Vector Embeddings for RAG
      document_embeddings: {
        Row: {
          id: string;
          content: string;
          embedding: number[];
          metadata: Record<string, any> | null;
          source: string | null;
          chunk_index: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          embedding: number[];
          metadata?: Record<string, any> | null;
          source?: string | null;
          chunk_index?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          embedding?: number[];
          metadata?: Record<string, any> | null;
          source?: string | null;
          chunk_index?: number | null;
          updated_at?: string;
        };
      };
    };
    
    Views: {
      // User Dashboard View
      user_dashboard_stats: {
        Row: {
          user_id: string;
          total_sessions: number;
          resolved_sessions: number;
          success_rate: number;
          recent_sessions: Record<string, any>[];
          personality_profile: Record<string, any> | null;
          current_achievements: string[];
          next_milestones: Record<string, any>[];
        };
      };
      
      // Session Analytics View
      session_analytics: {
        Row: {
          session_id: string;
          participant_count: number;
          message_count: number;
          emotion_analysis_count: number;
          ai_insights_count: number;
          resolution_timeline: Record<string, any>[];
          effectiveness_metrics: Record<string, any>;
        };
      };
    };
    
    Functions: {
      // Custom database functions
      get_user_stats: {
        Args: { user_id: string };
        Returns: Record<string, any>;
      };
      
      update_session_analytics: {
        Args: { session_id: string };
        Returns: boolean;
      };
      
      calculate_personality_match: {
        Args: { user1_id: string; user2_id: string };
        Returns: number;
      };
    };
  };
}

// Helper types for common operations
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type ConflictSession = Database['public']['Tables']['conflict_sessions']['Row'];
export type ConflictSessionInsert = Database['public']['Tables']['conflict_sessions']['Insert'];
export type ConflictSessionUpdate = Database['public']['Tables']['conflict_sessions']['Update'];

export type ConversationMessage = Database['public']['Tables']['conversation_messages']['Row'];
export type ConversationMessageInsert = Database['public']['Tables']['conversation_messages']['Insert'];
export type ConversationMessageUpdate = Database['public']['Tables']['conversation_messages']['Update'];

export type EmotionAnalysis = Database['public']['Tables']['emotion_analyses']['Row'];
export type EmotionAnalysisInsert = Database['public']['Tables']['emotion_analyses']['Insert'];
export type EmotionAnalysisUpdate = Database['public']['Tables']['emotion_analyses']['Update'];

export type AIInsight = Database['public']['Tables']['ai_insights']['Row'];
export type AIInsightInsert = Database['public']['Tables']['ai_insights']['Insert'];
export type AIInsightUpdate = Database['public']['Tables']['ai_insights']['Update'];

export type UserAnalytics = Database['public']['Tables']['user_analytics']['Row'];
export type UserAnalyticsInsert = Database['public']['Tables']['user_analytics']['Insert'];
export type UserAnalyticsUpdate = Database['public']['Tables']['user_analytics']['Update'];

// Dashboard and analytics types
export type UserDashboardStats = Database['public']['Views']['user_dashboard_stats']['Row'];
export type SessionAnalytics = Database['public']['Views']['session_analytics']['Row'];

// Vector embeddings types
export type DocumentEmbedding = Database['public']['Tables']['document_embeddings']['Row'];
export type DocumentEmbeddingInsert = Database['public']['Tables']['document_embeddings']['Insert'];
export type DocumentEmbeddingUpdate = Database['public']['Tables']['document_embeddings']['Update'];
