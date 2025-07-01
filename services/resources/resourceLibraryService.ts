/**
 * Resource Library Service
 * Manages conflict resolution and communication resources
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: ResourceCategory;
  type: ResourceType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  tags: string[];
  author?: string;
  createdAt: Date;
  updatedAt: Date;
  isBookmarked?: boolean;
  completedAt?: Date;
  rating?: number;
}

export type ResourceCategory = 
  | 'communication'
  | 'conflict_resolution'
  | 'emotional_intelligence'
  | 'active_listening'
  | 'empathy'
  | 'negotiation'
  | 'boundaries'
  | 'stress_management'
  | 'relationship_building';

export type ResourceType = 
  | 'article'
  | 'exercise'
  | 'technique'
  | 'checklist'
  | 'reflection'
  | 'video'
  | 'audio'
  | 'interactive';

export interface ResourceProgress {
  resourceId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
  notes?: string;
  rating?: number;
}

export interface ResourceRecommendation {
  resource: Resource;
  reason: string;
  relevanceScore: number;
  basedOn: 'session_analysis' | 'user_progress' | 'popular' | 'personalized';
}

class ResourceLibraryService {
  private readonly RESOURCES_KEY = 'resource_library';
  private readonly PROGRESS_KEY = 'resource_progress';
  private readonly BOOKMARKS_KEY = 'resource_bookmarks';

  /**
   * Initialize the resource library with default content
   */
  async initialize(): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(this.RESOURCES_KEY);
      if (!existing) {
        const defaultResources = this.getDefaultResources();
        await AsyncStorage.setItem(this.RESOURCES_KEY, JSON.stringify(defaultResources));
      }
    } catch (error) {
      console.error('Failed to initialize resource library:', error);
    }
  }

  /**
   * Get all resources
   */
  async getAllResources(): Promise<Resource[]> {
    try {
      const stored = await AsyncStorage.getItem(this.RESOURCES_KEY);
      if (!stored) {
        await this.initialize();
        return this.getDefaultResources();
      }
      
      const resources = JSON.parse(stored);
      return resources.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        completedAt: r.completedAt ? new Date(r.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to get resources:', error);
      return [];
    }
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(category: ResourceCategory): Promise<Resource[]> {
    const resources = await this.getAllResources();
    return resources.filter(r => r.category === category);
  }

  /**
   * Get resources by type
   */
  async getResourcesByType(type: ResourceType): Promise<Resource[]> {
    const resources = await this.getAllResources();
    return resources.filter(r => r.type === type);
  }

  /**
   * Search resources
   */
  async searchResources(query: string): Promise<Resource[]> {
    const resources = await this.getAllResources();
    const lowercaseQuery = query.toLowerCase();
    
    return resources.filter(resource => 
      resource.title.toLowerCase().includes(lowercaseQuery) ||
      resource.description.toLowerCase().includes(lowercaseQuery) ||
      resource.content.toLowerCase().includes(lowercaseQuery) ||
      resource.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get personalized resource recommendations
   */
  async getRecommendations(
    userId: string,
    sessionData?: any,
    limit: number = 5
  ): Promise<ResourceRecommendation[]> {
    const resources = await this.getAllResources();
    const progress = await this.getUserProgress(userId);
    const recommendations: ResourceRecommendation[] = [];

    // Session-based recommendations
    if (sessionData) {
      const sessionRecommendations = this.getSessionBasedRecommendations(resources, sessionData);
      recommendations.push(...sessionRecommendations);
    }

    // Progress-based recommendations
    const progressRecommendations = this.getProgressBasedRecommendations(resources, progress);
    recommendations.push(...progressRecommendations);

    // Popular resources
    const popularRecommendations = this.getPopularRecommendations(resources);
    recommendations.push(...popularRecommendations);

    // Sort by relevance score and return top results
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Mark resource as completed
   */
  async markResourceCompleted(
    resourceId: string,
    userId: string,
    rating?: number,
    notes?: string
  ): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      const existingIndex = progress.findIndex(p => p.resourceId === resourceId);
      
      const completedProgress: ResourceProgress = {
        resourceId,
        userId,
        startedAt: existingIndex >= 0 ? progress[existingIndex].startedAt : new Date(),
        completedAt: new Date(),
        progress: 100,
        rating,
        notes
      };

      if (existingIndex >= 0) {
        progress[existingIndex] = completedProgress;
      } else {
        progress.push(completedProgress);
      }

      await AsyncStorage.setItem(`${this.PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to mark resource as completed:', error);
    }
  }

  /**
   * Update resource progress
   */
  async updateResourceProgress(
    resourceId: string,
    userId: string,
    progressPercent: number
  ): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      const existingIndex = progress.findIndex(p => p.resourceId === resourceId);
      
      if (existingIndex >= 0) {
        progress[existingIndex].progress = progressPercent;
        progress[existingIndex].startedAt = progress[existingIndex].startedAt || new Date();
      } else {
        progress.push({
          resourceId,
          userId,
          startedAt: new Date(),
          progress: progressPercent
        });
      }

      await AsyncStorage.setItem(`${this.PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to update resource progress:', error);
    }
  }

  /**
   * Toggle resource bookmark
   */
  async toggleBookmark(resourceId: string, userId: string): Promise<boolean> {
    try {
      const bookmarks = await this.getUserBookmarks(userId);
      const isBookmarked = bookmarks.includes(resourceId);
      
      let updatedBookmarks: string[];
      if (isBookmarked) {
        updatedBookmarks = bookmarks.filter(id => id !== resourceId);
      } else {
        updatedBookmarks = [...bookmarks, resourceId];
      }
      
      await AsyncStorage.setItem(`${this.BOOKMARKS_KEY}_${userId}`, JSON.stringify(updatedBookmarks));
      return !isBookmarked;
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      return false;
    }
  }

  /**
   * Get user's bookmarked resources
   */
  async getBookmarkedResources(userId: string): Promise<Resource[]> {
    try {
      const bookmarks = await this.getUserBookmarks(userId);
      const resources = await this.getAllResources();
      
      return resources.filter(r => bookmarks.includes(r.id));
    } catch (error) {
      console.error('Failed to get bookmarked resources:', error);
      return [];
    }
  }

  /**
   * Get user's progress on all resources
   */
  async getUserProgress(userId: string): Promise<ResourceProgress[]> {
    try {
      const stored = await AsyncStorage.getItem(`${this.PROGRESS_KEY}_${userId}`);
      if (!stored) return [];
      
      const progress = JSON.parse(stored);
      return progress.map((p: any) => ({
        ...p,
        startedAt: new Date(p.startedAt),
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to get user progress:', error);
      return [];
    }
  }

  /**
   * Get user's bookmarks
   */
  private async getUserBookmarks(userId: string): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(`${this.BOOKMARKS_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get user bookmarks:', error);
      return [];
    }
  }

  /**
   * Get session-based recommendations
   */
  private getSessionBasedRecommendations(
    resources: Resource[],
    sessionData: any
  ): ResourceRecommendation[] {
    const recommendations: ResourceRecommendation[] = [];
    
    // Analyze session for relevant topics
    const emotions = sessionData.emotions || [];
    const topics = sessionData.topics || [];
    
    // Recommend based on detected emotions
    if (emotions.includes('anger') || emotions.includes('frustration')) {
      const angerResources = resources.filter(r => 
        r.tags.includes('anger_management') || 
        r.category === 'stress_management'
      );
      
      angerResources.forEach(resource => {
        recommendations.push({
          resource,
          reason: 'Based on emotions detected in your session',
          relevanceScore: 0.9,
          basedOn: 'session_analysis'
        });
      });
    }

    if (emotions.includes('sadness') || emotions.includes('disappointment')) {
      const empathyResources = resources.filter(r => 
        r.category === 'empathy' || 
        r.tags.includes('emotional_support')
      );
      
      empathyResources.forEach(resource => {
        recommendations.push({
          resource,
          reason: 'To help process difficult emotions',
          relevanceScore: 0.8,
          basedOn: 'session_analysis'
        });
      });
    }

    return recommendations;
  }

  /**
   * Get progress-based recommendations
   */
  private getProgressBasedRecommendations(
    resources: Resource[],
    progress: ResourceProgress[]
  ): ResourceRecommendation[] {
    const recommendations: ResourceRecommendation[] = [];
    const completedCategories = new Set<ResourceCategory>();
    
    // Find completed categories
    progress.forEach(p => {
      if (p.completedAt) {
        const resource = resources.find(r => r.id === p.resourceId);
        if (resource) {
          completedCategories.add(resource.category);
        }
      }
    });

    // Recommend next level resources in completed categories
    completedCategories.forEach(category => {
      const categoryResources = resources.filter(r => 
        r.category === category && 
        !progress.some(p => p.resourceId === r.id && p.completedAt)
      );
      
      categoryResources.forEach(resource => {
        recommendations.push({
          resource,
          reason: `Continue building skills in ${category.replace('_', ' ')}`,
          relevanceScore: 0.7,
          basedOn: 'user_progress'
        });
      });
    });

    return recommendations;
  }

  /**
   * Get popular resource recommendations
   */
  private getPopularRecommendations(resources: Resource[]): ResourceRecommendation[] {
    // For now, recommend beginner-friendly resources
    // In production, this would be based on actual usage analytics
    const popularResources = resources
      .filter(r => r.difficulty === 'beginner')
      .slice(0, 3);

    return popularResources.map(resource => ({
      resource,
      reason: 'Popular among users',
      relevanceScore: 0.5,
      basedOn: 'popular'
    }));
  }

  /**
   * Get default resources
   */
  private getDefaultResources(): Resource[] {
    const now = new Date();
    
    return [
      {
        id: 'active-listening-basics',
        title: 'Active Listening Fundamentals',
        description: 'Learn the core principles of active listening to improve your communication skills.',
        content: `
# Active Listening Fundamentals

Active listening is one of the most important skills for effective communication and conflict resolution.

## What is Active Listening?

Active listening means fully concentrating on what the other person is saying, both verbally and non-verbally. It involves:

- **Full attention**: Put away distractions and focus completely on the speaker
- **Non-judgmental attitude**: Listen without forming opinions or preparing your response
- **Emotional awareness**: Pay attention to the speaker's emotions and feelings
- **Clarification**: Ask questions to ensure you understand correctly

## Key Techniques

### 1. Paraphrasing
Repeat back what you heard in your own words:
- "What I'm hearing is..."
- "It sounds like you're saying..."
- "Let me make sure I understand..."

### 2. Reflecting Emotions
Acknowledge the speaker's feelings:
- "You seem frustrated about..."
- "I can hear the disappointment in your voice..."
- "It sounds like this is really important to you..."

### 3. Asking Open-Ended Questions
Encourage deeper sharing:
- "Can you tell me more about...?"
- "What was that experience like for you?"
- "How did that make you feel?"

## Practice Exercise

Try this with a friend or family member:
1. Choose a topic they care about
2. Listen for 5 minutes without interrupting
3. Paraphrase what you heard
4. Reflect their emotions
5. Ask one clarifying question

## Common Mistakes to Avoid

- **Interrupting**: Let the speaker finish their thoughts
- **Judging**: Avoid evaluating or criticizing what you hear
- **Problem-solving too quickly**: Sometimes people just want to be heard
- **Multitasking**: Give your full attention to the conversation

Remember: Active listening is a skill that improves with practice!
        `,
        category: 'active_listening',
        type: 'article',
        difficulty: 'beginner',
        estimatedTime: 10,
        tags: ['communication', 'listening', 'empathy', 'basics'],
        author: 'Understand.me Team',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'conflict-de-escalation',
        title: 'De-escalation Techniques',
        description: 'Learn how to calm tense situations and reduce conflict intensity.',
        content: `
# Conflict De-escalation Techniques

When conflicts heat up, knowing how to de-escalate can prevent situations from getting worse.

## The De-escalation Mindset

Before using techniques, adopt the right mindset:
- **Stay calm**: Your energy affects the other person
- **Show respect**: Even in disagreement, maintain dignity
- **Seek understanding**: Focus on learning, not winning
- **Be patient**: De-escalation takes time

## Verbal De-escalation Techniques

### 1. Lower Your Voice
- Speak more quietly than the other person
- Use a calm, steady tone
- Avoid matching their intensity

### 2. Acknowledge Their Feelings
- "I can see you're really upset about this"
- "Your frustration is understandable"
- "This is clearly important to you"

### 3. Find Common Ground
- "We both want what's best for..."
- "I think we agree that..."
- "Our shared goal is..."

### 4. Use "I" Statements
- "I want to understand your perspective"
- "I'm feeling confused about..."
- "I'd like to work together on this"

## Non-Verbal De-escalation

### Body Language
- Keep your posture open and relaxed
- Maintain appropriate eye contact
- Avoid crossing your arms or pointing
- Give the person space

### Facial Expressions
- Keep your expression neutral or concerned
- Avoid rolling your eyes or smirking
- Show genuine interest in understanding

## When to Take a Break

Sometimes the best de-escalation is a pause:
- "I think we both need a moment to cool down"
- "Let's take a 10-minute break and come back to this"
- "I want to give this the attention it deserves when we're both calmer"

## Practice Scenarios

Try these de-escalation phrases in different situations:
1. When someone is yelling
2. When someone feels unheard
3. When emotions are running high
4. When the conversation is going in circles

Remember: De-escalation is about creating space for understanding, not avoiding the issue.
        `,
        category: 'conflict_resolution',
        type: 'technique',
        difficulty: 'intermediate',
        estimatedTime: 15,
        tags: ['de-escalation', 'conflict', 'communication', 'calm'],
        author: 'Understand.me Team',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'empathy-building',
        title: 'Building Empathy Skills',
        description: 'Develop your ability to understand and connect with others\' experiences.',
        content: `
# Building Empathy Skills

Empathy is the ability to understand and share the feelings of another person. It's crucial for healthy relationships and effective conflict resolution.

## Types of Empathy

### Cognitive Empathy
Understanding someone's perspective intellectually:
- "I can see why you would think that"
- "From your point of view, that makes sense"
- "I understand your reasoning"

### Emotional Empathy
Actually feeling what someone else feels:
- Sharing in their joy or sadness
- Feeling moved by their story
- Being affected by their emotions

### Compassionate Empathy
Understanding and feeling, then taking action to help:
- Offering support
- Taking steps to address their needs
- Acting on your understanding

## Empathy-Building Exercises

### 1. Perspective-Taking
When someone shares something with you:
- Imagine you're in their shoes
- Consider their background and experiences
- Think about what you would feel in that situation

### 2. Emotional Labeling
Practice identifying emotions:
- In yourself: "I'm feeling frustrated because..."
- In others: "You seem disappointed that..."
- In situations: "This situation would make most people feel..."

### 3. Story Listening
When someone tells you about their day:
- Listen for the emotions behind the facts
- Ask about their feelings, not just events
- Reflect back what you hear emotionally

## Barriers to Empathy

### Personal Barriers
- Being too focused on your own problems
- Judging others quickly
- Assuming you know what they're thinking
- Being in a hurry or distracted

### Situational Barriers
- High stress or conflict
- Cultural differences
- Past negative experiences
- Power imbalances

## Empathy in Conflict

During disagreements, empathy helps by:
- Reducing defensiveness
- Creating emotional connection
- Finding common ground
- Generating creative solutions
- Building trust and understanding

## Daily Empathy Practice

Try these daily exercises:
1. **Morning intention**: Set an intention to understand one person better today
2. **Emotion check-ins**: Ask people how they're feeling, not just what they're doing
3. **Perspective journaling**: Write about a situation from someone else's point of view
4. **Gratitude for differences**: Appreciate how others' different experiences enrich your understanding

Remember: Empathy is a skill that grows stronger with practice and intention.
        `,
        category: 'empathy',
        type: 'exercise',
        difficulty: 'beginner',
        estimatedTime: 12,
        tags: ['empathy', 'understanding', 'emotions', 'connection'],
        author: 'Understand.me Team',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'boundary-setting',
        title: 'Healthy Boundary Setting',
        description: 'Learn to set and maintain healthy boundaries in relationships.',
        content: `
# Healthy Boundary Setting

Boundaries are the limits we set to protect our physical, emotional, and mental well-being. They're essential for healthy relationships.

## What Are Boundaries?

Boundaries are:
- **Personal limits**: What you will and won't accept
- **Self-care tools**: Ways to protect your well-being
- **Communication guidelines**: How you want to be treated
- **Relationship frameworks**: The structure for healthy connections

## Types of Boundaries

### Physical Boundaries
- Personal space and touch
- Privacy and possessions
- Time and availability

### Emotional Boundaries
- What emotions you'll take responsibility for
- How much emotional labor you'll provide
- Protection from emotional manipulation

### Mental Boundaries
- Your thoughts, beliefs, and values
- What topics you'll discuss
- Intellectual respect and autonomy

### Digital Boundaries
- Social media interactions
- Response times to messages
- Online privacy and sharing

## How to Set Boundaries

### 1. Identify Your Limits
Ask yourself:
- What makes me uncomfortable?
- When do I feel resentful or drained?
- What do I need to feel safe and respected?

### 2. Communicate Clearly
Use direct, honest language:
- "I'm not comfortable with..."
- "I need..."
- "I won't be able to..."
- "That doesn't work for me"

### 3. Be Consistent
- Follow through on your boundaries
- Don't make exceptions that compromise your well-being
- Reinforce boundaries when they're crossed

### 4. Start Small
- Begin with less challenging situations
- Practice with people who are more likely to respect boundaries
- Build your confidence gradually

## Common Boundary Challenges

### Guilt and Fear
- Fear of disappointing others
- Guilt about saying no
- Worry about being seen as selfish

### Pushback from Others
- People testing your boundaries
- Guilt trips or manipulation
- Anger or disappointment from others

### Internal Resistance
- Old patterns of people-pleasing
- Low self-worth
- Difficulty knowing what you want

## Boundary Scripts

### Saying No
- "I won't be able to do that"
- "That doesn't work for me"
- "I'm not available for that"

### Protecting Your Time
- "I have other commitments"
- "I need to check my schedule"
- "I'm not taking on new projects right now"

### Emotional Boundaries
- "I'm not comfortable discussing that"
- "I need some space to process this"
- "I can't take on your emotions right now"

## Maintaining Boundaries

### Self-Care
- Regular check-ins with yourself
- Adjusting boundaries as needed
- Celebrating when you maintain boundaries

### Support System
- Find people who respect your boundaries
- Seek support when boundaries are challenged
- Learn from others who model healthy boundaries

Remember: Boundaries aren't walls to keep people out—they're gates that let the right people in while protecting your well-being.
        `,
        category: 'boundaries',
        type: 'article',
        difficulty: 'intermediate',
        estimatedTime: 18,
        tags: ['boundaries', 'self-care', 'relationships', 'communication'],
        author: 'Understand.me Team',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'stress-management-basics',
        title: 'Stress Management During Conflict',
        description: 'Techniques to manage stress and stay calm during difficult conversations.',
        content: `
# Stress Management During Conflict

Conflict naturally triggers stress responses. Learning to manage stress helps you think clearly and respond thoughtfully.

## Understanding Stress in Conflict

### Physical Signs
- Increased heart rate
- Muscle tension
- Shallow breathing
- Sweating or trembling

### Emotional Signs
- Feeling overwhelmed
- Anger or irritability
- Anxiety or fear
- Feeling defensive

### Mental Signs
- Racing thoughts
- Difficulty concentrating
- Jumping to conclusions
- Black-and-white thinking

## Immediate Stress Management

### Breathing Techniques

**4-7-8 Breathing**
1. Inhale for 4 counts
2. Hold for 7 counts
3. Exhale for 8 counts
4. Repeat 3-4 times

**Box Breathing**
1. Inhale for 4 counts
2. Hold for 4 counts
3. Exhale for 4 counts
4. Hold for 4 counts
5. Repeat as needed

### Grounding Techniques

**5-4-3-2-1 Method**
Notice:
- 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

### Physical Release
- Gentle neck rolls
- Shoulder shrugs
- Clench and release fists
- Progressive muscle relaxation

## Cognitive Strategies

### Reframing Thoughts
Instead of: "This is a disaster"
Try: "This is challenging, but manageable"

Instead of: "They're attacking me"
Try: "They're expressing their frustration"

Instead of: "I can't handle this"
Try: "I can take this one step at a time"

### Perspective Taking
- Will this matter in 5 years?
- What would I tell a friend in this situation?
- What's the best possible outcome here?
- How can I learn from this experience?

## Long-term Stress Management

### Daily Practices
- Regular exercise
- Adequate sleep
- Healthy nutrition
- Mindfulness or meditation

### Emotional Regulation
- Journaling
- Talking to trusted friends
- Professional counseling
- Creative expression

### Conflict Preparation
- Practice difficult conversations
- Develop your communication skills
- Build emotional intelligence
- Create support systems

## During Conflict: The STOP Method

**S** - Stop what you're doing
**T** - Take a breath
**O** - Observe what's happening (thoughts, feelings, body)
**P** - Proceed with intention

## Recovery After Conflict

### Immediate Recovery
- Continue deep breathing
- Drink water
- Move your body gently
- Practice self-compassion

### Processing
- Reflect on what happened
- Identify what you learned
- Consider what you'd do differently
- Appreciate what went well

### Self-Care
- Do something nurturing for yourself
- Connect with supportive people
- Engage in activities you enjoy
- Get adequate rest

## Building Stress Resilience

### Regular Practice
- Daily stress management techniques
- Regular self-care routines
- Ongoing skill development
- Mindfulness practice

### Support Systems
- Trusted friends and family
- Professional support when needed
- Community connections
- Mentors or coaches

Remember: Managing stress during conflict isn't about eliminating all stress—it's about staying centered enough to respond thoughtfully rather than react impulsively.
        `,
        category: 'stress_management',
        type: 'technique',
        difficulty: 'beginner',
        estimatedTime: 20,
        tags: ['stress', 'calm', 'breathing', 'mindfulness', 'conflict'],
        author: 'Understand.me Team',
        createdAt: now,
        updatedAt: now
      }
    ];
  }
}

export const resourceLibraryService = new ResourceLibraryService();
export default resourceLibraryService;

