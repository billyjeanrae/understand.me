# understand.me 🤝

**🏆 Built at the Bolt.new Hackathon**

A voice-first, AI-mediated conflict resolution platform that transforms difficult conversations into opportunities for understanding and connection. Born from personal experience and powered by cutting-edge AI technology.

## 💝 The Story Behind understand.me

In my family, I've always been the one people call "their heart"—the person who tries to bridge gaps and bring everyone together. But despite my best efforts, I've seen how deeply misunderstandings can separate people, even cutting me off from those I love. 

This project was born from a deeply personal place, initially conceived as a way to help fix things and communicate better with my girlfriend, Juanita. Sadly, our relationship ended before I could finish it for us. That loss transformed my motivation. I decided to build "understand.me" not just for myself, but for anyone who has ever felt the pain of being misunderstood, hoping it could be the help for others that I wished I'd had.

## 🏆 Hackathon Journey

This project was a sprint against time and unforeseen circumstances. Starting on the 28th, I was racing against the clock with a heavy heart. Before we began, most of my team and I fell sick, which significantly impacted our momentum and ability to collaborate effectively. Pushing through illness while working on such an emotionally charged project was incredibly difficult.

Despite the immense personal and logistical challenges, I'm incredibly proud of creating a functional prototype that demonstrates the core vision. Building a system where an AI can not only understand words but also react to the emotion behind them feels like a genuine step forward in human-centric technology.

## 🤖 What understand.me Does

"understand.me" is a voice-first, AI-mediated conflict resolution app. It acts as an impartial guide, facilitating difficult conversations through a structured, five-phase process. Users interact with an empathetic AI mediator (Udine) primarily by speaking. The AI manages turn-taking, analyzes the emotional tone of the conversation using Hume AI, and helps users articulate their feelings, hear each other out, and collaboratively find a path forward. It's a private, accessible space designed to turn conflict into clarity and, ultimately, understanding.

## 🛠️ How We Built It

This project was a partnership between human experience and a sophisticated AI stack, planned and architected with the help of models like Google Gemini and GPT-o3.

### 🏗️ Technology Stack

- **Frontend:** **Expo (React Native)** for high-performance, cross-platform native app for iOS and Android
- **Backend & Orchestration:** **Express.js** backend with **Vercel AI SDK** as the "brain," orchestrating all AI interactions and managing conversational context
- **Voice Experience:** **ElevenLabs** powers the entire voice experience with natural-sounding AI voice and real-time conversation management
- **Emotional Intelligence:** **Hume AI** provides crucial emotional analysis, analyzing vocal tone to give the mediator true empathy
- **Database & Auth:** **Supabase** serves as our robust data layer for user authentication, database storage, and real-time communication

## 🌟 Core Features

### Voice-Guided Experience
- **Natural Conversation**: Real-time voice interaction with Udine AI mediator
- **Emotion Analysis**: Live emotional tone analysis during conversations
- **Turn-Taking Management**: Intelligent conversation flow control
- **Personalized Assessment**: Voice-based personality and communication style evaluation

### AI-Powered Mediation
- **Empathetic AI Assistant**: Udine specializes in conflict resolution and emotional intelligence
- **Context-Aware Responses**: Session-specific AI behavior for different interaction types
- **Tool Integration**: 6 core AI tools for emotion analysis, insights, and profile updates
- **Real-Time Processing**: Instant analysis and response generation

### Key Components

#### 🧠 **Intelligent AI Assistant**
- Emotion-aware responses with contextual understanding
- Personalized communication styles and intervention levels
- Real-time conflict analysis and strategy recommendations
- Adaptive learning from user interactions and outcomes

#### 👥 **Multi-Party Mediation**
- Structured group conflict resolution sessions
- Real-time chat with participant management
- Adaptive workflow management based on group dynamics
- Comprehensive session analytics and progress tracking

#### 📊 **Advanced Analytics & Insights**
- Emotional journey tracking with breakthrough moment identification
- Communication pattern analysis and effectiveness metrics
- Skill development tracking with personalized recommendations
- Predictive insights for conflict prevention and resolution success

#### 🎯 **Personalization Engine**
- Individual profile management with conflict preferences
- Adaptive AI personality and communication styles
- Learning pattern recognition and skill progress tracking
- Customized recommendations for continuous improvement

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- React Native development environment
- Expo CLI
- Google Generative AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/billyjeanrae/understand.me.git
   cd understand.me
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys:
   ```env
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - iOS: Press `i` or scan QR code with Camera app
   - Android: Press `a` or scan QR code with Expo Go app

## 📱 App Structure

### Screens
- **AuthScreen**: User authentication and onboarding
- **HomeScreen**: Main dashboard with quick actions and insights
- **ChatScreen**: One-on-one conflict resolution sessions
- **GroupConflictScreen**: Multi-party conflict management
- **ProfileScreen**: User profile and analytics dashboard
- **ConflictDashboardScreen**: Conflict history and management

### Services
- **AI Services**: Emotion analysis, chat, and personalization
- **User Services**: Profile management and personalization engine
- **Conflict Services**: Multi-party conflict and group mediation
- **Analytics Services**: Conversation and user analytics

### Key Features

#### 🎭 **Emotion Recognition**
```typescript
// Real-time emotion analysis
const emotions = await analyzeEmotion(message, 'text', {
  includeRecommendations: true,
  conflictContext: true
});
```

#### 🤖 **Personalized AI Responses**
```typescript
// Adaptive AI personality
const response = await chatWithUdine(history, message, {
  conflictType: 'family',
  usePersonalization: true,
  emotionContext: currentEmotions
});
```

#### 👥 **Group Mediation**
```typescript
// Start multi-party session
const session = await multiPartyConflictService.startSession(
  conflictId,
  facilitatorId,
  customAgenda
);
```

#### 📈 **Analytics Insights**
```typescript
// Generate user analytics
const analytics = await userAnalyticsService.generateUserAnalytics(
  userId,
  timeframe
);
```

## 🏗️ Architecture

### Frontend (React Native + Expo)
- **Navigation**: React Navigation with stack and tab navigators
- **State Management**: Zustand for global state management
- **UI Components**: Custom components with consistent design system
- **Styling**: StyleSheet with responsive design patterns

### AI Integration
- **Google Generative AI**: Advanced language model for conversation
- **Emotion Analysis**: Real-time emotional intelligence
- **Personalization**: Adaptive user experience engine

### Data Management
- **Local Storage**: AsyncStorage for offline-first approach
- **Analytics**: Comprehensive tracking and insights
- **Conflict Management**: Structured data models for complex scenarios

## 🎨 Design System

### Color Palette
- **Primary**: Deep blues and teals for trust and calm
- **Secondary**: Warm oranges and yellows for energy and optimism
- **Neutral**: Sophisticated grays for balance
- **Semantic**: Green for success, red for alerts, blue for information

### Typography
- **Headers**: Bold, clear hierarchy
- **Body**: Readable, accessible font sizes
- **Interactive**: Distinct styling for buttons and links

### Components
- **Consistent spacing**: 4px grid system
- **Rounded corners**: Friendly, approachable feel
- **Shadows**: Subtle depth and elevation
- **Animations**: Smooth, purposeful transitions

## 🚀 Deployment

### Development
```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

### Production Build
```bash
# Build for web (Netlify)
npm run build

# Preview build locally
npm run preview

# Build for mobile
npx expo build:ios
npx expo build:android

# Or with EAS Build
eas build --platform all
```

### Netlify Deployment

#### Option 1: Connect GitHub Repository
1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub account and select the `understand.me` repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables in Netlify dashboard:
   - `GOOGLE_GENAI_API_KEY`: Your Google AI API key
6. Deploy!

#### Option 2: Manual Deploy
```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Environment Variables
Set these in your Netlify dashboard under Site Settings > Environment Variables:
- `GOOGLE_GENAI_API_KEY`: Your Google Generative AI API key

## 📊 Analytics & Insights

### Conversation Analytics
- **Emotional Journey**: Track emotional progression throughout conversations
- **Communication Patterns**: Analyze communication effectiveness and style
- **Resolution Progress**: Monitor conflict resolution stages and success
- **AI Interaction**: Measure AI effectiveness and user satisfaction

### User Analytics
- **Skill Development**: Track progress across 12 core conflict resolution skills
- **Emotional Intelligence**: Monitor EQ growth and stability
- **Conflict Patterns**: Identify triggers, strategies, and success factors
- **Personalization**: Optimize AI interactions based on user preferences

### System Analytics
- **Platform Metrics**: User engagement, retention, and satisfaction
- **Feature Usage**: Track feature adoption and effectiveness
- **Performance**: Monitor system health and response times
- **Insights**: Generate actionable recommendations for improvement

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **TypeScript**: Strict typing for reliability
- **ESLint**: Consistent code formatting
- **Testing**: Comprehensive test coverage
- **Documentation**: Clear, helpful comments and docs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 What's Next for understand.me

The journey for "understand.me" is just beginning. The next steps are focused on refinement and expansion:

1. **Refining the AI Mediator**: Continuously improve the AI's conversational prompts and its ability to handle more complex and nuanced emotional scenarios
2. **Building the "Growth Tab"**: Implement the long-term vision of providing users with personalized insights into their communication patterns to help them grow over time
3. **User Testing & Feedback**: Get the app into the hands of real users to gather feedback and iteratively improve the experience
4. **Expanding Features**: Introduce features like session summaries, digital sign-offs on agreements, and a library of resources for better communication

## 🏆 Built with Bolt.new

This project was created during the Bolt.new Hackathon, showcasing the power of AI-assisted development and rapid prototyping.

[![Built with Bolt.new](https://storage.bolt.army/white_circle_360x360.png)](https://bolt.new/?rid=os72mi)

## 🤝 Our Technology Partners

We're grateful to our technology partners who made this vision possible:

### 🎤 **ElevenLabs**
Powering our natural voice experience with advanced conversational AI and real-time voice synthesis.
[Learn more →](https://elevenlabs.io)

### 🧠 **Hume AI**
Providing emotional intelligence through advanced emotion analysis and vocal tone recognition.
[Learn more →](https://hume.ai)

### 🗄️ **Supabase**
Delivering robust database, authentication, and real-time communication infrastructure.
[Learn more →](https://supabase.com)

### 🤖 **Google AI**
Enabling intelligent conversation and context understanding through Gemini models.
[Learn more →](https://ai.google.dev)

### 📱 **Expo**
Simplifying cross-platform mobile development with powerful tools and services.
[Learn more →](https://expo.dev)

### ⚡ **Vercel**
Orchestrating AI interactions with the powerful Vercel AI SDK.
[Learn more →](https://vercel.com)

## 🙏 Acknowledgments

- **Bolt.new Community**: For the incredible hackathon opportunity and platform
- **All our technology partners**: For providing the tools that made this vision possible
- **Conflict Resolution Experts**: For guidance on mediation best practices
- **Everyone who has ever felt misunderstood**: This is for you

## 📞 Support

- **Documentation**: [docs.understand.me](https://docs.understand.me)
- **Community**: [Discord Server](https://discord.gg/understand-me)
- **Issues**: [GitHub Issues](https://github.com/billyjeanrae/understand.me/issues)
- **Email**: support@understand.me

---

**understand.me** - Transforming conflict into connection, one conversation at a time. 🌟
