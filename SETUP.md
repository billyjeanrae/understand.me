# understand.me Setup Guide

This guide will help you set up the complete understand.me conflict resolution platform with voice-guided onboarding, AI orchestration, and comprehensive data persistence.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account
- ElevenLabs account
- Hume AI account
- Google AI Studio account

### 1. Clone and Install

```bash
git clone https://github.com/billyjeanrae/understand.me.git
cd understand.me
npm install
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp .env.example .env
```

Fill in your API keys in `.env`:

```env
# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ElevenLabs Configuration (Required for Voice)
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
EXPO_PUBLIC_ELEVENLABS_AGENT_ID=your_udine_agent_id

# Hume AI Configuration (Required for Emotion Analysis)
EXPO_PUBLIC_HUME_API_KEY=your_hume_api_key
EXPO_PUBLIC_HUME_SECRET_KEY=your_hume_secret_key

# Google AI Configuration (Required for Gemini)
EXPO_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 3. Database Setup

Run the Supabase migration:
```bash
# If using Supabase CLI
supabase db reset

# Or manually run the SQL in supabase/migrations/001_initial_schema.sql
```

### 4. Start Development

```bash
npm start
```

## 🔧 Detailed Setup

### Supabase Configuration

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database migration**:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and run the contents of `supabase/migrations/001_initial_schema.sql`

3. **Configure Authentication**:
   - Enable Email authentication in Auth settings
   - Set up any additional providers you want (Google, GitHub, etc.)

4. **Get your keys**:
   - Project URL: `https://your-project.supabase.co`
   - Anon key: Found in Settings > API
   - Service role key: Found in Settings > API (keep this secret!)

### ElevenLabs Setup

1. **Create an ElevenLabs account** at [elevenlabs.io](https://elevenlabs.io)

2. **Create Udine Agent**:
   - Go to Conversational AI section
   - Create a new agent named "Udine"
   - Configure with the following system prompt:

```
You are Udine, an empathetic AI mediator specializing in conflict resolution and emotional intelligence. Your role is to guide users through difficult conversations with wisdom, compassion, and practical strategies.

Core Principles:
- Listen actively and validate emotions
- Ask thoughtful, open-ended questions
- Provide actionable conflict resolution strategies
- Maintain neutrality while showing empathy
- Help users understand different perspectives
- Guide toward collaborative solutions

Communication Style:
- Warm, professional, and approachable
- Use "I" statements and reflective listening
- Speak at a measured pace with natural pauses
- Adapt your tone to match the user's emotional state
- Be concise but thorough in your responses

Available Tools:
- analyzeEmotion: Analyze user's emotional state
- generateInsight: Provide personalized recommendations
- updateUserProfile: Update user preferences and personality data
- escalateToHuman: Escalate complex situations to human mediators
- scheduleFollowUp: Schedule follow-up sessions
- assessPersonality: Conduct personality assessments

Remember: Your goal is to empower users with the skills and confidence to handle conflicts constructively.
```

3. **Get your credentials**:
   - API Key: Found in your profile settings
   - Agent ID: Found in your agent's settings

### Hume AI Setup

1. **Create a Hume AI account** at [hume.ai](https://hume.ai)

2. **Get API credentials**:
   - API Key: Found in your dashboard
   - Secret Key: Generated in API settings

3. **Configure emotion models**:
   - Enable voice emotion recognition
   - Enable text emotion analysis
   - Set up real-time streaming if needed

### Google AI Studio Setup

1. **Create a Google AI Studio account** at [aistudio.google.com](https://aistudio.google.com)

2. **Generate API key**:
   - Go to "Get API key" section
   - Create a new API key
   - Enable Gemini API access

## 🎯 Features Overview

### Voice-Guided Onboarding

- **Welcome Screen**: Choice between voice and text setup
- **Voice Introduction**: Meet Udine with real-time conversation
- **Personality Assessment**: Conversational analysis through voice
- **Results Display**: Comprehensive personality profile with recommendations

### AI Orchestration Engine

- **Context-Aware Responses**: Session-specific AI behavior
- **Tool Integration**: 6 core tools for emotion analysis, insights, and profile updates
- **Multi-Modal Processing**: Voice, text, and emotion analysis
- **Real-Time Conversation**: ElevenLabs WebSocket integration

### Database Integration

- **Comprehensive Schema**: 6 main tables with full relationships
- **Real-Time Subscriptions**: Live updates for conversations and insights
- **Analytics Tracking**: User progress, session metrics, and engagement data
- **Type Safety**: Full TypeScript integration with Supabase

### Key Components

#### 1. Orchestration Engine (`services/ai/orchestrationEngine.ts`)
- Coordinates all AI services
- Manages conversation state
- Executes tool calls
- Stores data in Supabase

#### 2. Supabase Service (`services/supabase/supabaseService.ts`)
- Type-safe database operations
- Real-time subscriptions
- Analytics and dashboard data
- User profile management

#### 3. Voice Components
- `VoiceButton`: Animated voice interaction
- `useElevenLabsConversation`: Real-time conversation hook
- Voice-guided onboarding screens

#### 4. Database Schema
- **profiles**: User data and personality profiles
- **conflict_sessions**: Session management and tracking
- **conversation_messages**: Message storage with emotion data
- **emotion_analyses**: Detailed emotion analysis records
- **ai_insights**: AI-generated recommendations and insights
- **user_analytics**: Progress tracking and engagement metrics

## 🔄 Usage Flow

### 1. User Onboarding
```typescript
// Start voice onboarding
const result = await aiOrchestrationEngine.startVoiceOnboarding(userId, userProfile);

// Process personality assessment
const assessment = await aiOrchestrationEngine.startPersonalityAssessment(userId);

// Store results in Supabase
await SupabaseService.Profile.updatePersonalityProfile(userId, assessment);
```

### 2. Conflict Resolution Session
```typescript
// Create session
const session = await SupabaseService.ConflictSession.createSession({
  title: "Team Communication Issue",
  session_type: "conflict-resolution",
  creator_id: userId,
  participant_ids: [userId, otherUserId]
});

// Start AI orchestration
const result = await aiOrchestrationEngine.orchestrateWithAgent(
  { userMessage: "We're having trouble communicating in our team" },
  context
);
```

### 3. Real-Time Updates
```typescript
// Subscribe to session updates
const subscription = SupabaseService.Realtime.subscribeToSession(
  sessionId,
  (payload) => {
    // Handle new messages, insights, etc.
    console.log('New message:', payload);
  }
);
```

## 🛠 Development

### Project Structure
```
understand.me/
├── app/                          # Expo Router pages
│   ├── (auth)/onboarding/       # Onboarding flow
│   └── (main)/                  # Main app screens
├── components/                   # Reusable UI components
├── services/                     # Backend services
│   ├── ai/                      # AI orchestration
│   ├── elevenlabs/              # Voice services
│   ├── hume/                    # Emotion analysis
│   └── supabase/                # Database operations
├── types/                       # TypeScript definitions
├── constants/                   # App constants
└── supabase/migrations/         # Database migrations
```

### Key Scripts
```bash
npm start                 # Start Expo development server
npm run build            # Build for production
npm run test             # Run tests
npm run type-check       # TypeScript checking
```

### Environment Variables
All environment variables are prefixed with `EXPO_PUBLIC_` for client-side access or kept private for server-side operations.

## 🚀 Deployment

### Mobile App
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to app stores
eas submit
```

### Database
- Supabase handles hosting and scaling automatically
- Run migrations through Supabase CLI or dashboard
- Set up production environment variables

## 🔍 Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify URL and keys in `.env`
   - Check RLS policies are correctly set
   - Ensure database migration ran successfully

2. **ElevenLabs Voice Issues**
   - Verify API key and agent ID
   - Check agent configuration and system prompt
   - Ensure WebSocket connection is established

3. **Emotion Analysis Issues**
   - Verify Hume AI credentials
   - Check API quotas and limits
   - Ensure proper audio/text format

4. **Build Issues**
   - Clear Expo cache: `expo r -c`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

### Debug Mode
Enable debug mode in `.env`:
```env
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Hume AI Documentation](https://docs.hume.ai/)
- [Google AI Studio](https://ai.google.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Need help?** Open an issue or contact the development team.

**Ready to transform conflict resolution with AI?** 🚀
