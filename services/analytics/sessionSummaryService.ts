/**
 * Session Summary Service
 * Generates comprehensive summaries of conflict resolution sessions
 */

import { chatWithUdine } from '../ai/chat';
import { analyzeEmotion } from '../hume';

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotions?: any;
  phase?: string;
}

export interface SessionSummary {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  totalMessages: number;
  phases: SessionPhase[];
  emotionalJourney: EmotionalInsight[];
  keyInsights: string[];
  resolutionOutcomes: string[];
  nextSteps: string[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  conflictResolved: boolean;
  participantGrowth: string[];
}

export interface SessionPhase {
  phase: string;
  startTime: Date;
  endTime: Date;
  messageCount: number;
  keyTopics: string[];
  emotionalTone: string;
}

export interface EmotionalInsight {
  timestamp: Date;
  primaryEmotion: string;
  intensity: number;
  context: string;
  breakthrough?: boolean;
}

class SessionSummaryService {
  /**
   * Generate a comprehensive summary of a conflict resolution session
   */
  async generateSessionSummary(
    sessionId: string,
    messages: SessionMessage[]
  ): Promise<SessionSummary> {
    if (messages.length === 0) {
      throw new Error('Cannot generate summary for empty session');
    }

    const startTime = messages[0].timestamp;
    const endTime = messages[messages.length - 1].timestamp;
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // Analyze session phases
    const phases = await this.analyzeSessionPhases(messages);
    
    // Track emotional journey
    const emotionalJourney = await this.analyzeEmotionalJourney(messages);
    
    // Generate key insights using AI
    const keyInsights = await this.generateKeyInsights(messages);
    
    // Identify resolution outcomes
    const resolutionOutcomes = await this.identifyResolutionOutcomes(messages);
    
    // Generate next steps
    const nextSteps = await this.generateNextSteps(messages);
    
    // Assess overall sentiment and resolution status
    const overallSentiment = this.assessOverallSentiment(emotionalJourney);
    const conflictResolved = await this.assessConflictResolution(messages);
    
    // Identify participant growth areas
    const participantGrowth = await this.identifyParticipantGrowth(messages);

    return {
      sessionId,
      startTime,
      endTime,
      duration,
      totalMessages: messages.length,
      phases,
      emotionalJourney,
      keyInsights,
      resolutionOutcomes,
      nextSteps,
      overallSentiment,
      conflictResolved,
      participantGrowth
    };
  }

  /**
   * Analyze the different phases of the conflict resolution session
   */
  private async analyzeSessionPhases(messages: SessionMessage[]): Promise<SessionPhase[]> {
    const phases: SessionPhase[] = [];
    let currentPhase = messages[0].phase || 'introduction';
    let phaseStart = messages[0].timestamp;
    let phaseMessages: SessionMessage[] = [];

    for (const message of messages) {
      if (message.phase && message.phase !== currentPhase) {
        // Phase transition detected
        if (phaseMessages.length > 0) {
          const phase = await this.createPhaseAnalysis(
            currentPhase,
            phaseStart,
            phaseMessages[phaseMessages.length - 1].timestamp,
            phaseMessages
          );
          phases.push(phase);
        }
        
        currentPhase = message.phase;
        phaseStart = message.timestamp;
        phaseMessages = [message];
      } else {
        phaseMessages.push(message);
      }
    }

    // Add final phase
    if (phaseMessages.length > 0) {
      const phase = await this.createPhaseAnalysis(
        currentPhase,
        phaseStart,
        phaseMessages[phaseMessages.length - 1].timestamp,
        phaseMessages
      );
      phases.push(phase);
    }

    return phases;
  }

  /**
   * Create analysis for a specific phase
   */
  private async createPhaseAnalysis(
    phaseName: string,
    startTime: Date,
    endTime: Date,
    messages: SessionMessage[]
  ): Promise<SessionPhase> {
    const content = messages.map(m => m.content).join(' ');
    
    // Use AI to extract key topics
    const keyTopicsPrompt = `
      Analyze this ${phaseName} phase of a conflict resolution session and identify 3-5 key topics discussed:
      
      ${content}
      
      Return only a JSON array of key topics as strings.
    `;

    let keyTopics: string[] = [];
    try {
      const response = await chatWithUdine([], keyTopicsPrompt);
      keyTopics = JSON.parse(response);
    } catch (error) {
      console.warn('Failed to extract key topics:', error);
      keyTopics = ['Communication', 'Understanding', 'Resolution'];
    }

    // Determine emotional tone
    const emotionalTone = await this.determineEmotionalTone(messages);

    return {
      phase: phaseName,
      startTime,
      endTime,
      messageCount: messages.length,
      keyTopics,
      emotionalTone
    };
  }

  /**
   * Analyze the emotional journey throughout the session
   */
  private async analyzeEmotionalJourney(messages: SessionMessage[]): Promise<EmotionalInsight[]> {
    const insights: EmotionalInsight[] = [];

    for (const message of messages) {
      if (message.role === 'user' && message.emotions) {
        const primaryEmotion = message.emotions.topEmotions?.[0]?.name || 'neutral';
        const intensity = message.emotions.topEmotions?.[0]?.score || 0;
        
        insights.push({
          timestamp: message.timestamp,
          primaryEmotion,
          intensity,
          context: message.content.substring(0, 100) + '...',
          breakthrough: this.detectEmotionalBreakthrough(message, insights)
        });
      }
    }

    return insights;
  }

  /**
   * Generate key insights using AI analysis
   */
  private async generateKeyInsights(messages: SessionMessage[]): Promise<string[]> {
    const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const prompt = `
      Analyze this conflict resolution session and provide 3-5 key insights about the conversation:
      
      ${conversation}
      
      Focus on:
      - Communication patterns
      - Emotional breakthroughs
      - Understanding achieved
      - Problem-solving approaches
      
      Return as a JSON array of insight strings.
    `;

    try {
      const response = await chatWithUdine([], prompt);
      return JSON.parse(response);
    } catch (error) {
      console.warn('Failed to generate insights:', error);
      return [
        'Participant engaged in open communication',
        'Emotional awareness increased during session',
        'Progress made toward mutual understanding'
      ];
    }
  }

  /**
   * Identify resolution outcomes
   */
  private async identifyResolutionOutcomes(messages: SessionMessage[]): Promise<string[]> {
    const lastMessages = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
    
    const prompt = `
      Based on the end of this conflict resolution session, identify specific resolution outcomes:
      
      ${lastMessages}
      
      Return as a JSON array of specific outcomes achieved.
    `;

    try {
      const response = await chatWithUdine([], prompt);
      return JSON.parse(response);
    } catch (error) {
      console.warn('Failed to identify outcomes:', error);
      return ['Session completed with mutual understanding'];
    }
  }

  /**
   * Generate actionable next steps
   */
  private async generateNextSteps(messages: SessionMessage[]): Promise<string[]> {
    const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const prompt = `
      Based on this conflict resolution session, suggest 3-5 specific next steps for the participant:
      
      ${conversation}
      
      Focus on actionable items that will help maintain progress and prevent future conflicts.
      Return as a JSON array of next step strings.
    `;

    try {
      const response = await chatWithUdine([], prompt);
      return JSON.parse(response);
    } catch (error) {
      console.warn('Failed to generate next steps:', error);
      return [
        'Practice active listening in future conversations',
        'Reflect on insights gained during this session',
        'Apply conflict resolution techniques learned'
      ];
    }
  }

  /**
   * Assess overall sentiment of the session
   */
  private assessOverallSentiment(emotionalJourney: EmotionalInsight[]): 'positive' | 'neutral' | 'negative' {
    if (emotionalJourney.length === 0) return 'neutral';

    const avgIntensity = emotionalJourney.reduce((sum, insight) => sum + insight.intensity, 0) / emotionalJourney.length;
    const positiveEmotions = ['joy', 'contentment', 'relief', 'hope', 'gratitude'];
    const negativeEmotions = ['anger', 'sadness', 'frustration', 'anxiety', 'disappointment'];

    const positiveCount = emotionalJourney.filter(insight => 
      positiveEmotions.includes(insight.primaryEmotion.toLowerCase())
    ).length;

    const negativeCount = emotionalJourney.filter(insight => 
      negativeEmotions.includes(insight.primaryEmotion.toLowerCase())
    ).length;

    if (positiveCount > negativeCount && avgIntensity > 0.6) return 'positive';
    if (negativeCount > positiveCount && avgIntensity > 0.7) return 'negative';
    return 'neutral';
  }

  /**
   * Assess whether the conflict was resolved
   */
  private async assessConflictResolution(messages: SessionMessage[]): Promise<boolean> {
    const lastMessages = messages.slice(-3).map(m => m.content).join(' ');
    
    const resolutionKeywords = [
      'resolved', 'solution', 'agreement', 'understanding', 'clarity',
      'better', 'progress', 'forward', 'positive', 'thank you'
    ];

    const hasResolutionIndicators = resolutionKeywords.some(keyword => 
      lastMessages.toLowerCase().includes(keyword)
    );

    return hasResolutionIndicators && messages.length >= 6;
  }

  /**
   * Identify areas for participant growth
   */
  private async identifyParticipantGrowth(messages: SessionMessage[]): Promise<string[]> {
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join('\n');
    
    const prompt = `
      Based on the participant's messages in this conflict resolution session, identify 2-3 areas for personal growth:
      
      ${userMessages}
      
      Focus on communication skills, emotional intelligence, and conflict resolution abilities.
      Return as a JSON array of growth area strings.
    `;

    try {
      const response = await chatWithUdine([], prompt);
      return JSON.parse(response);
    } catch (error) {
      console.warn('Failed to identify growth areas:', error);
      return [
        'Continue developing active listening skills',
        'Practice expressing emotions constructively'
      ];
    }
  }

  /**
   * Determine emotional tone for a phase
   */
  private async determineEmotionalTone(messages: SessionMessage[]): Promise<string> {
    const emotions = messages
      .filter(m => m.emotions?.topEmotions)
      .flatMap(m => m.emotions.topEmotions)
      .sort((a: any, b: any) => b.score - a.score);

    if (emotions.length === 0) return 'neutral';
    return emotions[0].name || 'neutral';
  }

  /**
   * Detect emotional breakthroughs
   */
  private detectEmotionalBreakthrough(
    message: SessionMessage, 
    previousInsights: EmotionalInsight[]
  ): boolean {
    if (previousInsights.length < 2) return false;

    const recent = previousInsights.slice(-2);
    const currentIntensity = message.emotions?.topEmotions?.[0]?.score || 0;
    const avgRecentIntensity = recent.reduce((sum, insight) => sum + insight.intensity, 0) / recent.length;

    // Breakthrough detected if there's a significant positive shift
    return currentIntensity > avgRecentIntensity + 0.3 && 
           ['joy', 'relief', 'contentment', 'hope'].includes(
             message.emotions?.topEmotions?.[0]?.name?.toLowerCase() || ''
           );
  }

  /**
   * Export session summary to different formats
   */
  async exportSummary(summary: SessionSummary, format: 'json' | 'text' | 'pdf'): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(summary, null, 2);
      
      case 'text':
        return this.formatSummaryAsText(summary);
      
      case 'pdf':
        // For now, return formatted text - PDF generation would require additional libraries
        return this.formatSummaryAsText(summary);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Format summary as readable text
   */
  private formatSummaryAsText(summary: SessionSummary): string {
    const duration = `${Math.floor(summary.duration / 60)}h ${summary.duration % 60}m`;
    
    return `
CONFLICT RESOLUTION SESSION SUMMARY
===================================

Session ID: ${summary.sessionId}
Date: ${summary.startTime.toLocaleDateString()}
Duration: ${duration}
Total Messages: ${summary.totalMessages}
Conflict Resolved: ${summary.conflictResolved ? 'Yes' : 'In Progress'}
Overall Sentiment: ${summary.overallSentiment.toUpperCase()}

PHASES
------
${summary.phases.map(phase => `
${phase.phase.toUpperCase()}
- Duration: ${Math.round((phase.endTime.getTime() - phase.startTime.getTime()) / 60000)} minutes
- Messages: ${phase.messageCount}
- Key Topics: ${phase.keyTopics.join(', ')}
- Emotional Tone: ${phase.emotionalTone}
`).join('')}

KEY INSIGHTS
------------
${summary.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

RESOLUTION OUTCOMES
------------------
${summary.resolutionOutcomes.map((outcome, i) => `${i + 1}. ${outcome}`).join('\n')}

NEXT STEPS
----------
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

GROWTH AREAS
------------
${summary.participantGrowth.map((area, i) => `${i + 1}. ${area}`).join('\n')}

EMOTIONAL JOURNEY
-----------------
${summary.emotionalJourney.map(insight => `
${insight.timestamp.toLocaleTimeString()}: ${insight.primaryEmotion} (${Math.round(insight.intensity * 100)}%)
${insight.breakthrough ? '🌟 BREAKTHROUGH MOMENT' : ''}
Context: ${insight.context}
`).join('')}
    `.trim();
  }
}

export const sessionSummaryService = new SessionSummaryService();
export default sessionSummaryService;

