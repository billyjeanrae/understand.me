-- understand.me Database Schema
-- Initial migration for comprehensive conflict resolution platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Onboarding Data
  onboarding_completed BOOLEAN DEFAULT FALSE,
  voice_onboarding_completed BOOLEAN DEFAULT FALSE,
  personality_assessment_completed BOOLEAN DEFAULT FALSE,
  
  -- Personality Profile
  communication_style TEXT CHECK (communication_style IN ('direct', 'diplomatic', 'analytical', 'empathetic')),
  conflict_style TEXT CHECK (conflict_style IN ('competitive', 'collaborative', 'accommodating', 'avoiding', 'compromising')),
  emotional_intelligence INTEGER CHECK (emotional_intelligence >= 0 AND emotional_intelligence <= 10),
  personality_traits TEXT[],
  personality_recommendations TEXT[],
  
  -- Preferences
  voice_enabled BOOLEAN DEFAULT TRUE,
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT,
  notification_preferences JSONB DEFAULT '{}'::jsonb
);

-- Conflict Sessions Table
CREATE TABLE conflict_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Session Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'resolved', 'escalated')),
  session_type TEXT NOT NULL CHECK (session_type IN ('onboarding', 'conflict-resolution', 'personality-assessment', 'practice')),
  
  -- Participants
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  participant_ids UUID[] NOT NULL,
  mediator_type TEXT DEFAULT 'ai' CHECK (mediator_type IN ('ai', 'human', 'hybrid')),
  
  -- Session Data
  conflict_level INTEGER DEFAULT 0 CHECK (conflict_level >= 0 AND conflict_level <= 10),
  resolution_potential INTEGER DEFAULT 5 CHECK (resolution_potential >= 0 AND resolution_potential <= 10),
  session_phase TEXT DEFAULT 'opening' CHECK (session_phase IN ('opening', 'exploration', 'negotiation', 'resolution', 'closing')),
  
  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  -- Results
  resolution_achieved BOOLEAN DEFAULT FALSE,
  satisfaction_scores JSONB,
  follow_up_scheduled BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  tags TEXT[],
  notes TEXT
);

-- Conversation Messages Table
CREATE TABLE conversation_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES conflict_sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id TEXT NOT NULL, -- Can be user ID or 'udine-ai'
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai', 'mediator')),
  
  -- Message Content
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'system', 'tool_call', 'emotion_analysis')),
  
  -- Audio Data
  audio_url TEXT,
  audio_duration INTEGER,
  transcription TEXT,
  
  -- Emotion Analysis
  emotion_data JSONB,
  conflict_level INTEGER CHECK (conflict_level >= 0 AND conflict_level <= 10),
  
  -- AI Data
  ai_confidence DECIMAL(3,2) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  tool_calls JSONB[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Emotion Analysis Records Table
CREATE TABLE emotion_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES conflict_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Analysis Data
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('voice', 'text', 'facial', 'combined')),
  raw_data JSONB NOT NULL,
  processed_data JSONB NOT NULL,
  
  -- Metrics
  conflict_level INTEGER NOT NULL CHECK (conflict_level >= 0 AND conflict_level <= 10),
  resolution_potential INTEGER NOT NULL CHECK (resolution_potential >= 0 AND resolution_potential <= 10),
  emotional_state TEXT NOT NULL,
  dominant_emotions TEXT[] NOT NULL,
  
  -- Context
  session_phase TEXT NOT NULL,
  trigger_event TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights and Recommendations Table
CREATE TABLE ai_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES conflict_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Insight Data
  insight_type TEXT NOT NULL CHECK (insight_type IN ('recommendation', 'pattern', 'warning', 'opportunity', 'summary')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Context
  trigger_data JSONB,
  related_emotions TEXT[],
  session_phase TEXT NOT NULL,
  
  -- Actions
  suggested_actions TEXT[],
  implemented BOOLEAN DEFAULT FALSE,
  effectiveness_score DECIMAL(3,2) CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Session Notes Table
CREATE TABLE session_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES conflict_sessions(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Note Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('observation', 'action_item', 'breakthrough', 'concern', 'general')),
  
  -- Metadata
  tags TEXT[],
  is_starred BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participant Invitations Table
CREATE TABLE participant_invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES conflict_sessions(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Invitation Details
  invitation_method TEXT NOT NULL CHECK (invitation_method IN ('email', 'sms', 'manual', 'contact')),
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT NOT NULL,
  role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'mediator', 'observer')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invitation_token TEXT UNIQUE,
  
  -- Custom Message
  custom_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  responded_at TIMESTAMPTZ
);

-- Message Reactions Table
CREATE TABLE message_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES conversation_messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Reaction Details
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('agree', 'disagree', 'like', 'concern', 'question')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one reaction per user per message
  UNIQUE(message_id, user_id, reaction_type)
);

-- Session Participants Table (for tracking active participants)
CREATE TABLE session_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES conflict_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Participation Details
  role TEXT DEFAULT 'participant' CHECK (role IN ('creator', 'participant', 'mediator', 'observer')),
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'removed')),
  
  -- Activity Tracking
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Permissions
  can_invite_others BOOLEAN DEFAULT FALSE,
  can_moderate BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per session
  UNIQUE(session_id, user_id)
);

-- User Analytics and Progress Table
CREATE TABLE user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
  
  -- Session Stats
  total_sessions INTEGER DEFAULT 0,
  resolved_sessions INTEGER DEFAULT 0,
  average_session_duration INTEGER DEFAULT 0,
  
  -- Skill Development
  communication_improvement INTEGER DEFAULT 0 CHECK (communication_improvement >= 0 AND communication_improvement <= 100),
  emotional_regulation_score INTEGER DEFAULT 0 CHECK (emotional_regulation_score >= 0 AND emotional_regulation_score <= 100),
  conflict_resolution_success_rate INTEGER DEFAULT 0 CHECK (conflict_resolution_success_rate >= 0 AND conflict_resolution_success_rate <= 100),
  
  -- Engagement
  voice_usage_percentage INTEGER DEFAULT 0 CHECK (voice_usage_percentage >= 0 AND voice_usage_percentage <= 100),
  ai_interaction_count INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Achievements
  achievements_unlocked TEXT[],
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_conflict_sessions_creator ON conflict_sessions(creator_id);
CREATE INDEX idx_conflict_sessions_status ON conflict_sessions(status);
CREATE INDEX idx_conflict_sessions_type ON conflict_sessions(session_type);
CREATE INDEX idx_conversation_messages_session ON conversation_messages(session_id);
CREATE INDEX idx_conversation_messages_sender ON conversation_messages(sender_id);
CREATE INDEX idx_conversation_messages_created ON conversation_messages(created_at);
CREATE INDEX idx_emotion_analyses_session ON emotion_analyses(session_id);
CREATE INDEX idx_emotion_analyses_user ON emotion_analyses(user_id);
CREATE INDEX idx_emotion_analyses_created ON emotion_analyses(created_at);
CREATE INDEX idx_ai_insights_session ON ai_insights(session_id);
CREATE INDEX idx_ai_insights_user ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_user_analytics_user ON user_analytics(user_id);
CREATE INDEX idx_session_notes_session ON session_notes(session_id);
CREATE INDEX idx_session_notes_author ON session_notes(author_id);
CREATE INDEX idx_session_notes_category ON session_notes(category);
CREATE INDEX idx_session_notes_created ON session_notes(created_at);
CREATE INDEX idx_participant_invitations_session ON participant_invitations(session_id);
CREATE INDEX idx_participant_invitations_inviter ON participant_invitations(inviter_id);
CREATE INDEX idx_participant_invitations_status ON participant_invitations(status);
CREATE INDEX idx_participant_invitations_token ON participant_invitations(invitation_token);
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user ON message_reactions(user_id);
CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_user ON session_participants(user_id);
CREATE INDEX idx_session_participants_status ON session_participants(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conflict_sessions_updated_at BEFORE UPDATE ON conflict_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_notes_updated_at BEFORE UPDATE ON session_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_analytics_updated_at BEFORE UPDATE ON user_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Conflict sessions policies
CREATE POLICY "Users can view own sessions" ON conflict_sessions FOR SELECT USING (
  auth.uid() = creator_id OR auth.uid() = ANY(participant_ids)
);
CREATE POLICY "Users can create sessions" ON conflict_sessions FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own sessions" ON conflict_sessions FOR UPDATE USING (
  auth.uid() = creator_id OR auth.uid() = ANY(participant_ids)
);

-- Conversation messages policies
CREATE POLICY "Users can view session messages" ON conversation_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conflict_sessions 
    WHERE id = session_id 
    AND (auth.uid() = creator_id OR auth.uid() = ANY(participant_ids))
  )
);
CREATE POLICY "Users can insert messages" ON conversation_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM conflict_sessions 
    WHERE id = session_id 
    AND (auth.uid() = creator_id OR auth.uid() = ANY(participant_ids))
  )
);

-- Emotion analyses policies
CREATE POLICY "Users can view own analyses" ON emotion_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON emotion_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI insights policies
CREATE POLICY "Users can view own insights" ON ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON ai_insights FOR UPDATE USING (auth.uid() = user_id);

-- User analytics policies
CREATE POLICY "Users can view own analytics" ON user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON user_analytics FOR UPDATE USING (auth.uid() = user_id);

-- Session notes policies
CREATE POLICY "Users can view session notes" ON session_notes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conflict_sessions 
    WHERE id = session_id 
    AND (auth.uid() = creator_id OR auth.uid() = ANY(participant_ids))
  )
);
CREATE POLICY "Users can create session notes" ON session_notes FOR INSERT WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM conflict_sessions 
    WHERE id = session_id 
    AND (auth.uid() = creator_id OR auth.uid() = ANY(participant_ids))
  )
);
CREATE POLICY "Users can update own session notes" ON session_notes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own session notes" ON session_notes FOR DELETE USING (auth.uid() = author_id);

-- Participant invitations policies
CREATE POLICY "Users can view session invitations" ON participant_invitations FOR SELECT USING (
  auth.uid() = inviter_id OR
  EXISTS (
    SELECT 1 FROM conflict_sessions 
    WHERE id = session_id 
    AND (auth.uid() = creator_id OR auth.uid() = ANY(participant_ids))
  )
);
CREATE POLICY "Users can create invitations" ON participant_invitations FOR INSERT WITH CHECK (
  auth.uid() = inviter_id AND
  EXISTS (
    SELECT 1 FROM conflict_sessions 
    WHERE id = session_id 
    AND (auth.uid() = creator_id OR auth.uid() = ANY(participant_ids))
  )
);
CREATE POLICY "Users can update own invitations" ON participant_invitations FOR UPDATE USING (auth.uid() = inviter_id);

-- Message reactions policies
CREATE POLICY "Users can view message reactions" ON message_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversation_messages cm
    JOIN conflict_sessions cs ON cs.id = cm.session_id
    WHERE cm.id = message_id 
    AND (auth.uid() = cs.creator_id OR auth.uid() = ANY(cs.participant_ids))
  )
);
CREATE POLICY "Users can create own reactions" ON message_reactions FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM conversation_messages cm
    JOIN conflict_sessions cs ON cs.id = cm.session_id
    WHERE cm.id = message_id 
    AND (auth.uid() = cs.creator_id OR auth.uid() = ANY(cs.participant_ids))
  )
);
CREATE POLICY "Users can delete own reactions" ON message_reactions FOR DELETE USING (auth.uid() = user_id);

-- Session participants policies
CREATE POLICY "Users can view session participants" ON session_participants FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM conflict_sessions 
    WHERE id = session_id 
    AND (auth.uid() = creator_id OR auth.uid() = ANY(participant_ids))
  )
);
CREATE POLICY "Users can update own participation" ON session_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Session creators can manage participants" ON session_participants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM conflict_sessions 
    WHERE id = session_id 
    AND auth.uid() = creator_id
  )
);

-- Create views for dashboard and analytics
CREATE VIEW user_dashboard_stats AS
SELECT 
  p.id as user_id,
  ua.total_sessions,
  ua.resolved_sessions,
  CASE 
    WHEN ua.total_sessions > 0 THEN (ua.resolved_sessions::float / ua.total_sessions::float * 100)::integer
    ELSE 0 
  END as success_rate,
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', cs.id,
        'title', cs.title,
        'status', cs.status,
        'created_at', cs.created_at
      )
    ) FROM conflict_sessions cs 
    WHERE cs.creator_id = p.id OR p.id = ANY(cs.participant_ids)
    ORDER BY cs.created_at DESC 
    LIMIT 5), 
    '[]'::json
  ) as recent_sessions,
  json_build_object(
    'communication_style', p.communication_style,
    'conflict_style', p.conflict_style,
    'emotional_intelligence', p.emotional_intelligence,
    'traits', p.personality_traits,
    'recommendations', p.personality_recommendations
  ) as personality_profile,
  COALESCE(ua.achievements_unlocked, ARRAY[]::text[]) as current_achievements,
  '[]'::json as next_milestones
FROM profiles p
LEFT JOIN user_analytics ua ON ua.user_id = p.id;

-- Create session analytics view
CREATE VIEW session_analytics AS
SELECT 
  cs.id as session_id,
  array_length(cs.participant_ids, 1) as participant_count,
  (SELECT COUNT(*) FROM conversation_messages cm WHERE cm.session_id = cs.id) as message_count,
  (SELECT COUNT(*) FROM emotion_analyses ea WHERE ea.session_id = cs.id) as emotion_analysis_count,
  (SELECT COUNT(*) FROM ai_insights ai WHERE ai.session_id = cs.id) as ai_insights_count,
  '[]'::json as resolution_timeline,
  json_build_object(
    'conflict_level', cs.conflict_level,
    'resolution_potential', cs.resolution_potential,
    'duration_minutes', cs.duration_minutes,
    'resolution_achieved', cs.resolution_achieved
  ) as effectiveness_metrics
FROM conflict_sessions cs;

-- Create database functions
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_sessions', COALESCE(ua.total_sessions, 0),
    'resolved_sessions', COALESCE(ua.resolved_sessions, 0),
    'success_rate', CASE 
      WHEN COALESCE(ua.total_sessions, 0) > 0 
      THEN (COALESCE(ua.resolved_sessions, 0)::float / ua.total_sessions::float * 100)::integer
      ELSE 0 
    END,
    'current_streak', COALESCE(ua.current_streak, 0),
    'voice_usage', COALESCE(ua.voice_usage_percentage, 0),
    'last_active', ua.last_active_at
  ) INTO result
  FROM user_analytics ua
  WHERE ua.user_id = get_user_stats.user_id;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_session_analytics(session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- This function can be used to recalculate session metrics
  -- Implementation would depend on specific analytics requirements
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_personality_match(user1_id UUID, user2_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user1_profile profiles%ROWTYPE;
  user2_profile profiles%ROWTYPE;
  match_score INTEGER := 0;
BEGIN
  SELECT * INTO user1_profile FROM profiles WHERE id = user1_id;
  SELECT * INTO user2_profile FROM profiles WHERE id = user2_id;
  
  -- Simple compatibility scoring based on communication and conflict styles
  IF user1_profile.communication_style = user2_profile.communication_style THEN
    match_score := match_score + 25;
  END IF;
  
  IF user1_profile.conflict_style = user2_profile.conflict_style THEN
    match_score := match_score + 25;
  END IF;
  
  -- Add emotional intelligence compatibility
  IF ABS(COALESCE(user1_profile.emotional_intelligence, 5) - COALESCE(user2_profile.emotional_intelligence, 5)) <= 2 THEN
    match_score := match_score + 25;
  END IF;
  
  -- Base compatibility score
  match_score := match_score + 25;
  
  RETURN LEAST(match_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get session notes with filtering
CREATE OR REPLACE FUNCTION get_session_notes(
  session_id_param UUID,
  category_filter TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  is_starred BOOLEAN,
  is_archived BOOLEAN,
  author_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sn.id,
    sn.title,
    sn.content,
    sn.category,
    sn.tags,
    sn.is_starred,
    sn.is_archived,
    COALESCE(p.full_name, p.username) as author_name,
    sn.created_at,
    sn.updated_at
  FROM session_notes sn
  JOIN profiles p ON p.id = sn.author_id
  WHERE sn.session_id = session_id_param
    AND (category_filter IS NULL OR sn.category = category_filter)
    AND (search_query IS NULL OR 
         sn.title ILIKE '%' || search_query || '%' OR 
         sn.content ILIKE '%' || search_query || '%')
    AND sn.is_archived = FALSE
  ORDER BY sn.is_starred DESC, sn.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(token TEXT, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  invitation participant_invitations%ROWTYPE;
BEGIN
  -- Get invitation
  SELECT * INTO invitation 
  FROM participant_invitations 
  WHERE invitation_token = token 
    AND status = 'pending' 
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update invitation status
  UPDATE participant_invitations 
  SET status = 'accepted', responded_at = NOW()
  WHERE id = invitation.id;
  
  -- Add user to session participants
  INSERT INTO session_participants (session_id, user_id, role, status, joined_at)
  VALUES (invitation.session_id, user_id, invitation.role, 'joined', NOW())
  ON CONFLICT (session_id, user_id) 
  DO UPDATE SET status = 'joined', joined_at = NOW();
  
  -- Update session participant_ids array
  UPDATE conflict_sessions 
  SET participant_ids = array_append(participant_ids, user_id)
  WHERE id = invitation.session_id 
    AND NOT (user_id = ANY(participant_ids));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get message reactions count
CREATE OR REPLACE FUNCTION get_message_reactions(message_id_param UUID)
RETURNS TABLE (
  reaction_type TEXT,
  count BIGINT,
  user_reacted BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.reaction_type,
    COUNT(*) as count,
    BOOL_OR(mr.user_id = auth.uid()) as user_reacted
  FROM message_reactions mr
  WHERE mr.message_id = message_id_param
  GROUP BY mr.reaction_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
