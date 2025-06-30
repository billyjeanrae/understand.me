export interface HelpArticle {
  id: string;
  title: string;
  category: HelpCategory;
  content: string;
  tags: string[];
  lastUpdated: Date;
  readTime: number; // in minutes
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: HelpCategory;
  helpful: number;
  notHelpful: number;
}

export type HelpCategory = 
  | 'getting_started'
  | 'conflict_resolution'
  | 'achievements'
  | 'sessions'
  | 'settings'
  | 'troubleshooting'
  | 'tips_techniques';

export const HELP_CATEGORIES = [
  { id: 'getting_started', name: 'Getting Started', icon: '🚀' },
  { id: 'conflict_resolution', name: 'Conflict Resolution', icon: '🕊️' },
  { id: 'achievements', name: 'Achievements', icon: '🏆' },
  { id: 'sessions', name: 'Sessions', icon: '💬' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
  { id: 'tips_techniques', name: 'Tips & Techniques', icon: '💡' },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'welcome_guide',
    title: 'Welcome to understand.me',
    category: 'getting_started',
    content: `# Welcome to understand.me

understand.me is your personal conflict resolution companion, designed to help you develop better communication skills and resolve conflicts more effectively.

## What You Can Do

### 🏠 Home Dashboard
- View your progress overview
- See recent achievements
- Access quick session shortcuts
- Check your current streak

### 📊 Growth Tracking
- Monitor your achievement progress
- View detailed analytics
- Track skill development
- Celebrate milestones

### 💬 Session Management
- Start different types of sessions
- Review your session history
- Track skills used and outcomes
- Rate your experiences

### 👤 Profile & Settings
- Manage your account
- Customize preferences
- Access help and support
- Export your data

## Getting Started

1. **Complete your profile setup** - Add your information and preferences
2. **Take the personality assessment** - Understand your conflict resolution style
3. **Start your first session** - Begin with an individual session
4. **Explore achievements** - See what goals you can work towards
5. **Customize settings** - Adjust notifications and preferences

Ready to begin your journey? Start with your first conflict resolution session!`,
    tags: ['welcome', 'overview', 'getting started'],
    lastUpdated: new Date('2024-06-30'),
    readTime: 3,
  },
  {
    id: 'session_types',
    title: 'Understanding Session Types',
    category: 'sessions',
    content: `# Session Types Guide

understand.me offers different types of sessions to match your learning style and conflict resolution needs.

## 📱 Individual Sessions
Perfect for personal conflicts and self-reflection.
- **Duration**: 15-30 minutes
- **Best for**: Personal conflicts, workplace issues, family disputes
- **Features**: AI-guided conversation, skill suggestions, outcome tracking

## 🎤 Voice Sessions
Practice speaking and listening skills through voice interaction.
- **Duration**: 10-25 minutes
- **Best for**: Improving verbal communication, practicing difficult conversations
- **Features**: Voice recognition, tone analysis, speaking confidence building

## 👥 Group Mediation
Learn to facilitate resolution between multiple parties.
- **Duration**: 20-45 minutes
- **Best for**: Team conflicts, family disputes, group dynamics
- **Features**: Multi-perspective analysis, mediation techniques, group communication skills

## 📋 Personality Assessment
Understand your natural conflict resolution style.
- **Duration**: 10-15 minutes
- **Best for**: Self-awareness, understanding your approach to conflict
- **Features**: Detailed personality insights, strength identification, growth recommendations

## Tips for Success

1. **Choose the right session type** for your current situation
2. **Be honest and open** during sessions
3. **Take notes** on insights and techniques
4. **Practice regularly** to build skills
5. **Review your history** to track progress`,
    tags: ['sessions', 'types', 'guide'],
    lastUpdated: new Date('2024-06-30'),
    readTime: 4,
  },
  {
    id: 'achievement_system',
    title: 'Understanding Achievements',
    category: 'achievements',
    content: `# Achievement System Guide

The achievement system in understand.me is designed to motivate your growth and celebrate your progress in conflict resolution skills.

## Achievement Levels

### 🥉 Bronze Achievements
Entry-level achievements for getting started.
- **Points**: 10-30 points each
- **Examples**: First Steps, Voice Pioneer, Self-Discovery

### 🥈 Silver Achievements  
Intermediate achievements for developing skills.
- **Points**: 50-75 points each
- **Examples**: Week Warrior, Peacemaker

### 🥇 Gold Achievements
Advanced achievements for mastering techniques.
- **Points**: 100-150 points each
- **Examples**: Skill Collector, Growth Champion, Master Communicator

### 💎 Platinum Achievements
Elite achievements for exceptional dedication.
- **Points**: 200-300 points each
- **Examples**: Marathon Runner, Consistency Legend

## Achievement Categories

- **🕊️ Conflict Resolution**: Focus on resolving disputes
- **💬 Communication**: Improve speaking and listening skills
- **🌱 Personal Growth**: Develop self-awareness and emotional intelligence
- **🔥 Consistency**: Build regular practice habits
- **🎯 Mastery**: Demonstrate advanced skills
- **🏃‍♂️ Endurance**: Show long-term commitment

## Tips for Earning Achievements

1. **Complete sessions regularly** to build streaks
2. **Try different session types** to unlock variety achievements
3. **Use diverse skills** during sessions
4. **Rate your sessions** to track improvement
5. **Take the personality assessment** for instant achievement
6. **Set daily practice goals** for consistency achievements

Your achievements reflect your dedication to personal growth and conflict resolution mastery!`,
    tags: ['achievements', 'points', 'levels', 'progress'],
    lastUpdated: new Date('2024-06-30'),
    readTime: 5,
  },
  {
    id: 'conflict_resolution_basics',
    title: 'Conflict Resolution Fundamentals',
    category: 'conflict_resolution',
    content: `# Conflict Resolution Fundamentals

Learn the core principles and techniques for effective conflict resolution.

## The PEACE Method

### **P**ause
- Take a moment to breathe and center yourself
- Avoid reactive responses
- Create space for thoughtful communication

### **E**mpathize  
- Try to understand the other person's perspective
- Listen actively without judgment
- Acknowledge their feelings and concerns

### **A**nalyze
- Identify the root cause of the conflict
- Separate the person from the problem
- Look for underlying needs and interests

### **C**ollaborate
- Work together to find solutions
- Focus on win-win outcomes
- Be creative and flexible in problem-solving

### **E**valuate
- Assess the effectiveness of the solution
- Make adjustments as needed
- Learn from the experience

## Key Communication Skills

### Active Listening
- Give full attention to the speaker
- Reflect back what you hear
- Ask clarifying questions
- Avoid interrupting

### "I" Statements
- Express your feelings without blame
- Example: "I feel frustrated when..." instead of "You always..."
- Take responsibility for your emotions
- Focus on specific behaviors, not character

### Open-Ended Questions
- Encourage deeper conversation
- Examples: "How did that make you feel?" "What would help resolve this?"
- Avoid yes/no questions
- Show genuine curiosity

### Emotional Regulation
- Recognize your emotional triggers
- Use breathing techniques to stay calm
- Take breaks when needed
- Practice self-compassion

## Common Conflict Patterns

1. **Escalation**: When emotions intensify the conflict
2. **Avoidance**: When parties refuse to address issues
3. **Blame Game**: When focus shifts to fault-finding
4. **Win-Lose Mentality**: When compromise seems impossible

## Practice Exercises

- Role-play difficult conversations
- Practice active listening with friends
- Use "I" statements in daily interactions
- Reflect on past conflicts and alternative approaches

Remember: Conflict is natural and can lead to stronger relationships when handled skillfully!`,
    tags: ['conflict resolution', 'communication', 'techniques', 'peace method'],
    lastUpdated: new Date('2024-06-30'),
    readTime: 7,
  },
];

export const FAQS: FAQ[] = [
  {
    id: 'how_to_start',
    question: 'How do I start my first session?',
    answer: 'Go to the Sessions tab, select "New Session", choose your session type (Individual, Voice, Group, or Assessment), and follow the guided prompts. Individual sessions are great for beginners!',
    category: 'getting_started',
    helpful: 45,
    notHelpful: 2,
  },
  {
    id: 'achievement_points',
    question: 'How do achievement points work?',
    answer: 'You earn points by completing sessions, unlocking achievements, and reaching milestones. Bronze achievements give 10-30 points, Silver 50-75, Gold 100-150, and Platinum 200-300 points. Points reflect your overall progress and dedication.',
    category: 'achievements',
    helpful: 38,
    notHelpful: 1,
  },
  {
    id: 'session_privacy',
    question: 'Are my sessions private and secure?',
    answer: 'Yes, all your session data is stored locally on your device and encrypted. We take privacy seriously and never share your personal conflict resolution sessions with third parties.',
    category: 'settings',
    helpful: 52,
    notHelpful: 0,
  },
  {
    id: 'voice_not_working',
    question: 'Voice sessions aren\'t working properly',
    answer: 'Check that you\'ve granted microphone permissions to the app. Go to Settings > Voice Settings to test your microphone and adjust sensitivity. Ensure you\'re in a quiet environment for best results.',
    category: 'troubleshooting',
    helpful: 29,
    notHelpful: 3,
  },
  {
    id: 'streak_broken',
    question: 'My streak was broken, but I did complete a session',
    answer: 'Streaks are calculated based on completing sessions on consecutive days. Make sure to complete at least one session each day to maintain your streak. If you believe this is an error, try refreshing the app.',
    category: 'troubleshooting',
    helpful: 22,
    notHelpful: 5,
  },
  {
    id: 'export_data',
    question: 'Can I export my session data?',
    answer: 'Yes! Go to Profile > Export Data to download your session history, achievements, and progress reports in PDF or CSV format. This is useful for personal records or sharing with counselors.',
    category: 'settings',
    helpful: 31,
    notHelpful: 1,
  },
  {
    id: 'notification_settings',
    question: 'How do I customize notifications?',
    answer: 'Go to Profile > Settings > Notifications to customize which types of notifications you receive, set quiet hours, and adjust reminder frequencies. You can enable/disable achievements, session reminders, tips, and more.',
    category: 'settings',
    helpful: 27,
    notHelpful: 2,
  },
  {
    id: 'conflict_types',
    question: 'What types of conflicts can I work on?',
    answer: 'understand.me helps with various conflicts: workplace disagreements, family disputes, friendship issues, romantic relationship conflicts, team dynamics, and personal internal conflicts. The techniques are applicable to most interpersonal situations.',
    category: 'conflict_resolution',
    helpful: 41,
    notHelpful: 1,
  },
];

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to understand.me! 👋',
    description: 'Let\'s take a quick tour of your conflict resolution companion.',
    target: 'home',
  },
  {
    id: 'navigation',
    title: 'Navigate with Tabs 📱',
    description: 'Use the bottom tabs to access Home, Growth, Sessions, and Profile.',
    target: 'tabs',
  },
  {
    id: 'start_session',
    title: 'Start Your First Session 💬',
    description: 'Tap the Sessions tab to begin your conflict resolution journey.',
    target: 'sessions',
  },
  {
    id: 'track_progress',
    title: 'Track Your Growth 📊',
    description: 'The Growth tab shows your achievements and progress over time.',
    target: 'growth',
  },
  {
    id: 'customize_profile',
    title: 'Customize Your Experience 👤',
    description: 'Visit your Profile to adjust settings and preferences.',
    target: 'profile',
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🚀',
    description: 'Start with an Individual Session to begin building your conflict resolution skills.',
    target: 'complete',
  },
];
