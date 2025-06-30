# Understand.me - AI-Mediated Conflict Resolution Platform

🚀 **Status: Production Ready** - All dependencies resolved, linting issues fixed, and automated testing implemented.

## Overview

Understand.me is an innovative AI-mediated conflict resolution platform that helps individuals and groups navigate interpersonal disputes with empathy, understanding, and evidence-based mediation techniques.

### Key Features

- **AI-Powered Mediation**: Advanced conflict resolution using Udine, our specialized AI mediator
- **Emotion-Aware Responses**: Real-time emotion analysis for contextual guidance
- **Multi-Platform Support**: Native iOS, Android, and responsive web application
- **Voice & Text Interaction**: Flexible communication options for user comfort
- **Personalized Insights**: Tailored conflict resolution strategies based on user profiles
- **Progress Tracking**: Monitor resolution progress and personal growth

## Technology Stack

- **Frontend**: React Native with Expo SDK 53.0.0
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI/ML**: Google Gemini 2.0 Flash, ElevenLabs Voice AI
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet with responsive design
- **Development**: TypeScript, ESLint, Prettier

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

```bash
# Clone the repository
git clone https://github.com/billyjeanrae/understand.me.git
cd understand.me

# Install dependencies (automatically resolves conflicts)
npm install --force

# Fix any Expo SDK compatibility issues
npx expo install --fix

# Start development server
npx expo start --web
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Services
GOOGLE_GENAI_API_KEY=your_google_ai_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Optional: Analytics & Monitoring
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run web        # Start web development server
npm run ios        # Start iOS simulator
npm run android    # Start Android emulator
npm run build      # Build for production
npm run preview    # Preview production build
```

### Project Structure

```
understand.me/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (onboarding)/      # User onboarding flow
│   ├── (tabs)/            # Main app navigation
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable UI components
│   ├── common/           # Cross-platform components
│   ├── modals/           # Modal dialogs
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities and configurations
├── screens/              # Screen components
├── services/             # API and external service integrations
│   ├── ai/              # AI service integrations
│   └── user/            # User management services
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
└── utils/                # Helper functions and utilities
```

## Features in Detail

### AI-Mediated Conflict Resolution
- **Udine AI Mediator**: Specialized conflict resolution AI trained on mediation best practices
- **Emotion Analysis**: Real-time emotion detection and response adaptation
- **Contextual Guidance**: Situation-aware advice and intervention strategies
- **Multi-Modal Interaction**: Voice and text-based communication options

### User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 AA compliant interface
- **Offline Support**: Core functionality available without internet
- **Progressive Web App**: Installable web application

### Security & Privacy
- **End-to-End Encryption**: Secure communication channels
- **Data Minimization**: Only essential data collection
- **GDPR Compliant**: European privacy regulation compliance
- **Secure Authentication**: Multi-factor authentication support

## Deployment

### Web Deployment (Netlify)
```bash
# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### Mobile App Deployment
```bash
# Build for app stores
npx expo build:ios
npx expo build:android

# Submit to stores
npx expo submit:ios
npx expo submit:android
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs.understand.me](https://docs.understand.me)
- **Community**: [Discord Server](https://discord.gg/understand-me)
- **Issues**: [GitHub Issues](https://github.com/billyjeanrae/understand.me/issues)
- **Email**: support@understand.me

## Acknowledgments

- **Conflict Resolution Research**: Based on Harvard Negotiation Project methodologies
- **AI Ethics**: Aligned with Partnership on AI principles
- **Open Source**: Built with and contributing back to the open source community

---

**Built with ❤️ for better human connections**