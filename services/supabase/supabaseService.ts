/**
 * Comprehensive Supabase Service for understand.me
 * Handles all database operations with full type safety
 */

import { supabase } from '../../lib/supabase';
import {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  ConflictSession,
  ConflictSessionInsert,
  ConflictSessionUpdate,
  ConversationMessage,
  ConversationMessageInsert,
  ConversationMessageUpdate,
  EmotionAnalysis,
  EmotionAnalysisInsert,
  AIInsight,
  AIInsightInsert,
  UserAnalytics,
  UserAnalyticsInsert,
  UserAnalyticsUpdate,
  UserDashboardStats,
} from '../../types/database';

/**
 * User Profile Service
 */
export class ProfileService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Create new user profile
   */
  static async createProfile(profile: ProfileInsert): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  /**
   * Update onboarding progress
   */
  static async updateOnboardingProgress(
    userId: string,
    progress: {
      onboarding_completed?: boolean;
      voice_onboarding_completed?: boolean;
      personality_assessment_completed?: boolean;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...progress, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      return false;
    }
  }

  /**
   * Update personality profile
   */
  static async updatePersonalityProfile(
    userId: string,
    personalityData: {
      communication_style?: 'direct' | 'diplomatic' | 'analytical' | 'empathetic';
      conflict_style?: 'competitive' | 'collaborative' | 'accommodating' | 'avoiding' | 'compromising';
      emotional_intelligence?: number;
      personality_traits?: string[];
      personality_recommendations?: string[];
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          ...personalityData, 
          personality_assessment_completed: true,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating personality profile:', error);
      return false;
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned, username is available
        return true;
      }

      return !data;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }
}

/**
 * Conflict Session Service
 */
export class ConflictSessionService {
  /**
   * Create new conflict session
   */
  static async createSession(session: ConflictSessionInsert): Promise<ConflictSession | null> {
    try {
      const { data, error } = await supabase
        .from('conflict_sessions')
        .insert(session)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId: string): Promise<ConflictSession | null> {
    try {
      const { data, error } = await supabase
        .from('conflict_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * Update session
   */
  static async updateSession(sessionId: string, updates: ConflictSessionUpdate): Promise<ConflictSession | null> {
    try {
      const { data, error } = await supabase
        .from('conflict_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  }

  /**
   * Get user's sessions
   */
  static async getUserSessions(userId: string, limit = 10): Promise<ConflictSession[]> {
    try {
      const { data, error } = await supabase
        .from('conflict_sessions')
        .select('*')
        .or(`creator_id.eq.${userId},participant_ids.cs.{${userId}}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  /**
   * Start session (update status and timing)
   */
  static async startSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conflict_sessions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      return false;
    }
  }

  /**
   * End session
   */
  static async endSession(
    sessionId: string,
    resolution_achieved: boolean,
    satisfaction_scores?: Record<string, number>
  ): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return false;

      const endTime = new Date();
      const startTime = session.started_at ? new Date(session.started_at) : endTime;
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('conflict_sessions')
        .update({
          status: resolution_achieved ? 'resolved' : 'paused',
          ended_at: endTime.toISOString(),
          duration_minutes: duration,
          resolution_achieved,
          satisfaction_scores,
          updated_at: endTime.toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  }
}

/**
 * Conversation Message Service
 */
export class ConversationService {
  /**
   * Add message to conversation
   */
  static async addMessage(message: ConversationMessageInsert): Promise<ConversationMessage | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }

  /**
   * Get session messages
   */
  static async getSessionMessages(sessionId: string, limit = 50): Promise<ConversationMessage[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Update message with processing results
   */
  static async updateMessage(messageId: string, updates: ConversationMessageUpdate): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversation_messages')
        .update({ ...updates, processed_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating message:', error);
      return false;
    }
  }

  /**
   * Add AI response message
   */
  static async addAIResponse(
    sessionId: string,
    content: string,
    toolCalls?: Record<string, any>[],
    confidence?: number
  ): Promise<ConversationMessage | null> {
    return this.addMessage({
      session_id: sessionId,
      sender_id: 'udine-ai',
      sender_type: 'ai',
      content,
      message_type: 'text',
      tool_calls: toolCalls,
      ai_confidence: confidence,
    });
  }
}

/**
 * Emotion Analysis Service
 */
export class EmotionAnalysisService {
  /**
   * Store emotion analysis
   */
  static async storeAnalysis(analysis: EmotionAnalysisInsert): Promise<EmotionAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('emotion_analyses')
        .insert(analysis)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing emotion analysis:', error);
      return null;
    }
  }

  /**
   * Get session emotion analyses
   */
  static async getSessionAnalyses(sessionId: string): Promise<EmotionAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('emotion_analyses')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching emotion analyses:', error);
      return [];
    }
  }

  /**
   * Get user's emotion trends
   */
  static async getUserEmotionTrends(userId: string, days = 30): Promise<EmotionAnalysis[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('emotion_analyses')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching emotion trends:', error);
      return [];
    }
  }
}

/**
 * AI Insights Service
 */
export class AIInsightsService {
  /**
   * Store AI insight
   */
  static async storeInsight(insight: AIInsightInsert): Promise<AIInsight | null> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .insert(insight)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing AI insight:', error);
      return null;
    }
  }

  /**
   * Get session insights
   */
  static async getSessionInsights(sessionId: string): Promise<AIInsight[]> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching session insights:', error);
      return [];
    }
  }

  /**
   * Get user insights
   */
  static async getUserInsights(userId: string, limit = 10): Promise<AIInsight[]> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user insights:', error);
      return [];
    }
  }

  /**
   * Mark insight as implemented
   */
  static async markInsightImplemented(insightId: string, effectivenessScore?: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({
          implemented: true,
          effectiveness_score: effectivenessScore,
        })
        .eq('id', insightId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking insight as implemented:', error);
      return false;
    }
  }
}

/**
 * User Analytics Service
 */
export class UserAnalyticsService {
  /**
   * Get or create user analytics
   */
  static async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    try {
      // Try to get existing analytics
      const { data: existing, error: fetchError } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) return existing;

      // Create new analytics if none exist
      if (fetchError && fetchError.code === 'PGRST116') {
        const newAnalytics: UserAnalyticsInsert = {
          user_id: userId,
          total_sessions: 0,
          resolved_sessions: 0,
          average_session_duration: 0,
          communication_improvement: 0,
          emotional_regulation_score: 0,
          conflict_resolution_success_rate: 0,
          voice_usage_percentage: 0,
          ai_interaction_count: 0,
          last_active_at: new Date().toISOString(),
          current_streak: 0,
          longest_streak: 0,
        };

        const { data, error } = await supabase
          .from('user_analytics')
          .insert(newAnalytics)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      throw fetchError;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  /**
   * Update user analytics
   */
  static async updateAnalytics(userId: string, updates: UserAnalyticsUpdate): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_analytics')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating analytics:', error);
      return false;
    }
  }

  /**
   * Increment session count
   */
  static async incrementSessionCount(userId: string, resolved: boolean): Promise<boolean> {
    try {
      const analytics = await this.getUserAnalytics(userId);
      if (!analytics) return false;

      const updates: UserAnalyticsUpdate = {
        total_sessions: analytics.total_sessions + 1,
        resolved_sessions: resolved ? analytics.resolved_sessions + 1 : analytics.resolved_sessions,
        last_active_at: new Date().toISOString(),
      };

      // Calculate success rate
      updates.conflict_resolution_success_rate = 
        (updates.resolved_sessions! / updates.total_sessions!) * 100;

      return await this.updateAnalytics(userId, updates);
    } catch (error) {
      console.error('Error incrementing session count:', error);
      return false;
    }
  }

  /**
   * Update voice usage
   */
  static async updateVoiceUsage(userId: string, voiceUsed: boolean): Promise<boolean> {
    try {
      const analytics = await this.getUserAnalytics(userId);
      if (!analytics) return false;

      // Simple calculation - could be more sophisticated
      const currentPercentage = analytics.voice_usage_percentage;
      const totalSessions = analytics.total_sessions;
      const newPercentage = voiceUsed 
        ? ((currentPercentage * totalSessions) + 100) / (totalSessions + 1)
        : (currentPercentage * totalSessions) / (totalSessions + 1);

      return await this.updateAnalytics(userId, {
        voice_usage_percentage: Math.round(newPercentage),
      });
    } catch (error) {
      console.error('Error updating voice usage:', error);
      return false;
    }
  }
}

/**
 * Dashboard Service
 */
export class DashboardService {
  /**
   * Get comprehensive dashboard data
   */
  static async getDashboardData(userId: string): Promise<{
    profile: Profile | null;
    analytics: UserAnalytics | null;
    recentSessions: ConflictSession[];
    recentInsights: AIInsight[];
    emotionTrends: EmotionAnalysis[];
  }> {
    try {
      const [profile, analytics, recentSessions, recentInsights, emotionTrends] = await Promise.all([
        ProfileService.getProfile(userId),
        UserAnalyticsService.getUserAnalytics(userId),
        ConflictSessionService.getUserSessions(userId, 5),
        AIInsightsService.getUserInsights(userId, 5),
        EmotionAnalysisService.getUserEmotionTrends(userId, 7),
      ]);

      return {
        profile,
        analytics,
        recentSessions,
        recentInsights,
        emotionTrends,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        profile: null,
        analytics: null,
        recentSessions: [],
        recentInsights: [],
        emotionTrends: [],
      };
    }
  }
}

/**
 * Real-time Subscriptions Service
 */
export class RealtimeService {
  /**
   * Subscribe to session updates
   */
  static subscribeToSession(sessionId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to user insights
   */
  static subscribeToUserInsights(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`insights-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_insights',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  /**
   * Unsubscribe from channel
   */
  static unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  }
}

// Export all services
export const SupabaseService = {
  Profile: ProfileService,
  ConflictSession: ConflictSessionService,
  Conversation: ConversationService,
  EmotionAnalysis: EmotionAnalysisService,
  AIInsights: AIInsightsService,
  UserAnalytics: UserAnalyticsService,
  Dashboard: DashboardService,
  Realtime: RealtimeService,
};

export default SupabaseService;
