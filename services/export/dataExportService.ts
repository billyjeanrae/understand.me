import AsyncStorage from '@react-native-async-storage/async-storage';
import achievementService from '../achievements/achievementService';
import notificationService from '../notifications/notificationService';

export interface ExportData {
  user: {
    exportDate: Date;
    appVersion: string;
    platform: string;
  };
  achievements: {
    progress: any;
    unlockedAchievements: any[];
    totalPoints: number;
  };
  sessions: {
    history: any[];
    totalSessions: number;
    totalDuration: number;
    averageRating: number;
  };
  notifications: {
    settings: any;
    history: any[];
  };
  analytics: {
    streakDays: number;
    skillsUsed: string[];
    improvementScore: number;
    joinDate: Date;
  };
}

export type ExportFormat = 'json' | 'csv' | 'pdf';

class DataExportService {
  async exportAllData(format: ExportFormat = 'json'): Promise<string> {
    try {
      const exportData = await this.gatherAllData();
      
      switch (format) {
        case 'json':
          return this.exportAsJSON(exportData);
        case 'csv':
          return this.exportAsCSV(exportData);
        case 'pdf':
          return this.exportAsPDF(exportData);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  async exportSessionData(format: ExportFormat = 'csv'): Promise<string> {
    try {
      const sessionData = await this.getSessionData();
      
      switch (format) {
        case 'json':
          return JSON.stringify(sessionData, null, 2);
        case 'csv':
          return this.convertSessionsToCSV(sessionData);
        case 'pdf':
          return this.generateSessionsPDF(sessionData);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Failed to export session data:', error);
      throw new Error('Failed to export session data. Please try again.');
    }
  }

  async exportAchievementData(format: ExportFormat = 'json'): Promise<string> {
    try {
      const achievementData = await this.getAchievementData();
      
      switch (format) {
        case 'json':
          return JSON.stringify(achievementData, null, 2);
        case 'csv':
          return this.convertAchievementsToCSV(achievementData);
        case 'pdf':
          return this.generateAchievementsPDF(achievementData);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Failed to export achievement data:', error);
      throw new Error('Failed to export achievement data. Please try again.');
    }
  }

  private async gatherAllData(): Promise<ExportData> {
    const [achievementProgress, notifications, notificationSettings] = await Promise.all([
      achievementService.getAchievementProgress(),
      notificationService.getNotifications(),
      notificationService.getSettings(),
    ]);

    // Mock session data - in real app this would come from session service
    const sessionHistory = [
      {
        id: '1',
        title: 'Workplace Disagreement',
        date: new Date('2024-06-29'),
        duration: 25,
        status: 'completed',
        type: 'individual',
        rating: 4,
        skillsUsed: ['Active Listening', 'Empathy', 'Problem Solving'],
        outcome: 'Resolved successfully with mutual understanding',
      },
      {
        id: '2',
        title: 'Family Communication Issue',
        date: new Date('2024-06-28'),
        duration: 18,
        status: 'completed',
        type: 'voice',
        rating: 5,
        skillsUsed: ['Emotional Intelligence', 'Perspective Taking'],
        outcome: 'Improved family dynamics and communication',
      },
    ];

    const unlockedAchievements = achievementProgress.achievements.filter(a => a.isUnlocked);
    const totalDuration = sessionHistory.reduce((sum, s) => sum + s.duration, 0);
    const completedSessions = sessionHistory.filter(s => s.status === 'completed');
    const averageRating = completedSessions.reduce((sum, s) => sum + s.rating, 0) / completedSessions.length || 0;

    return {
      user: {
        exportDate: new Date(),
        appVersion: '1.0.0',
        platform: 'React Native',
      },
      achievements: {
        progress: achievementProgress,
        unlockedAchievements,
        totalPoints: achievementProgress.totalPoints,
      },
      sessions: {
        history: sessionHistory,
        totalSessions: sessionHistory.length,
        totalDuration,
        averageRating,
      },
      notifications: {
        settings: notificationSettings,
        history: notifications,
      },
      analytics: {
        streakDays: 5, // Mock data
        skillsUsed: ['Active Listening', 'Empathy', 'Problem Solving', 'Emotional Intelligence', 'Perspective Taking'],
        improvementScore: 78,
        joinDate: new Date('2024-01-15'),
      },
    };
  }

  private async getSessionData(): Promise<any[]> {
    // Mock session data - in real app this would come from session service
    return [
      {
        id: '1',
        title: 'Workplace Disagreement',
        date: '2024-06-29',
        duration: 25,
        status: 'completed',
        type: 'individual',
        rating: 4,
        skillsUsed: 'Active Listening, Empathy, Problem Solving',
        outcome: 'Resolved successfully with mutual understanding',
      },
      {
        id: '2',
        title: 'Family Communication Issue',
        date: '2024-06-28',
        duration: 18,
        status: 'completed',
        type: 'voice',
        rating: 5,
        skillsUsed: 'Emotional Intelligence, Perspective Taking',
        outcome: 'Improved family dynamics and communication',
      },
    ];
  }

  private async getAchievementData(): Promise<any> {
    const achievementProgress = await achievementService.getAchievementProgress();
    return {
      totalPoints: achievementProgress.totalPoints,
      unlockedCount: achievementProgress.unlockedCount,
      totalAchievements: achievementProgress.achievements.length,
      achievements: achievementProgress.achievements.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        difficulty: a.difficulty,
        points: a.points,
        progress: a.progress,
        isUnlocked: a.isUnlocked,
        unlockedAt: a.unlockedAt?.toISOString(),
      })),
    };
  }

  private exportAsJSON(data: ExportData): string {
    return JSON.stringify(data, null, 2);
  }

  private exportAsCSV(data: ExportData): string {
    // Create a summary CSV with key metrics
    const csvLines = [
      'Category,Metric,Value',
      `User,Export Date,${data.user.exportDate.toISOString()}`,
      `User,App Version,${data.user.appVersion}`,
      `User,Platform,${data.user.platform}`,
      '',
      `Achievements,Total Points,${data.achievements.totalPoints}`,
      `Achievements,Unlocked Count,${data.achievements.unlockedAchievements.length}`,
      `Achievements,Total Available,${data.achievements.progress.achievements.length}`,
      '',
      `Sessions,Total Sessions,${data.sessions.totalSessions}`,
      `Sessions,Total Duration (minutes),${data.sessions.totalDuration}`,
      `Sessions,Average Rating,${data.sessions.averageRating.toFixed(1)}`,
      '',
      `Analytics,Streak Days,${data.analytics.streakDays}`,
      `Analytics,Skills Used Count,${data.analytics.skillsUsed.length}`,
      `Analytics,Improvement Score,${data.analytics.improvementScore}`,
      `Analytics,Join Date,${data.analytics.joinDate.toISOString()}`,
    ];

    return csvLines.join('\n');
  }

  private convertSessionsToCSV(sessions: any[]): string {
    if (sessions.length === 0) {
      return 'No session data available';
    }

    const headers = Object.keys(sessions[0]).join(',');
    const rows = sessions.map(session => 
      Object.values(session).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  private convertAchievementsToCSV(achievementData: any): string {
    const headers = 'ID,Title,Description,Category,Difficulty,Points,Progress,Unlocked,Unlocked Date';
    const rows = achievementData.achievements.map((achievement: any) => 
      [
        achievement.id,
        `"${achievement.title}"`,
        `"${achievement.description}"`,
        achievement.category,
        achievement.difficulty,
        achievement.points,
        achievement.progress,
        achievement.isUnlocked,
        achievement.unlockedAt || '',
      ].join(',')
    );

    return [headers, ...rows].join('\n');
  }

  private exportAsPDF(data: ExportData): string {
    // For a real implementation, you would use a PDF generation library
    // For now, return a formatted text representation
    return `
UNDERSTAND.ME - DATA EXPORT REPORT
Generated: ${data.user.exportDate.toLocaleDateString()}
App Version: ${data.user.appVersion}

=== SUMMARY ===
Total Achievement Points: ${data.achievements.totalPoints}
Unlocked Achievements: ${data.achievements.unlockedAchievements.length}
Total Sessions: ${data.sessions.totalSessions}
Total Session Time: ${data.sessions.totalDuration} minutes
Average Session Rating: ${data.sessions.averageRating.toFixed(1)}/5
Current Streak: ${data.analytics.streakDays} days
Improvement Score: ${data.analytics.improvementScore}/100

=== ACHIEVEMENTS ===
${data.achievements.unlockedAchievements.map(a => 
  `• ${a.title} (${a.difficulty}) - ${a.points} points`
).join('\n')}

=== RECENT SESSIONS ===
${data.sessions.history.map(s => 
  `• ${s.title} - ${s.date} (${s.duration}min, ${s.rating}/5 stars)`
).join('\n')}

=== SKILLS DEVELOPED ===
${data.analytics.skillsUsed.map(skill => `• ${skill}`).join('\n')}

This report contains your personal conflict resolution journey data.
Keep this record for your personal development tracking.
    `.trim();
  }

  private generateSessionsPDF(sessions: any[]): string {
    return `
UNDERSTAND.ME - SESSION HISTORY REPORT
Generated: ${new Date().toLocaleDateString()}

=== SESSION SUMMARY ===
Total Sessions: ${sessions.length}
Total Duration: ${sessions.reduce((sum, s) => sum + s.duration, 0)} minutes
Average Rating: ${(sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length).toFixed(1)}/5

=== SESSION DETAILS ===
${sessions.map(session => `
Session: ${session.title}
Date: ${session.date}
Duration: ${session.duration} minutes
Type: ${session.type}
Rating: ${session.rating}/5 stars
Skills Used: ${session.skillsUsed}
Outcome: ${session.outcome}
`).join('\n---\n')}
    `.trim();
  }

  private generateAchievementsPDF(achievementData: any): string {
    return `
UNDERSTAND.ME - ACHIEVEMENTS REPORT
Generated: ${new Date().toLocaleDateString()}

=== ACHIEVEMENT SUMMARY ===
Total Points: ${achievementData.totalPoints}
Unlocked: ${achievementData.unlockedCount}/${achievementData.totalAchievements}
Completion Rate: ${((achievementData.unlockedCount / achievementData.totalAchievements) * 100).toFixed(1)}%

=== UNLOCKED ACHIEVEMENTS ===
${achievementData.achievements
  .filter((a: any) => a.isUnlocked)
  .map((a: any) => `
• ${a.title} (${a.difficulty.toUpperCase()})
  ${a.description}
  Points: ${a.points}
  Unlocked: ${a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : 'Unknown'}
`).join('\n')}

=== IN PROGRESS ===
${achievementData.achievements
  .filter((a: any) => !a.isUnlocked && a.progress > 0)
  .map((a: any) => `
• ${a.title} - ${a.progress.toFixed(1)}% complete
  ${a.description}
`).join('\n')}
    `.trim();
  }

  // Utility method to save data to device storage
  async saveExportToDevice(data: string, filename: string): Promise<void> {
    try {
      // In a real implementation, you would use react-native-fs or expo-file-system
      // to save the file to the device's downloads folder
      console.log(`Saving export data to ${filename}`);
      console.log('Data length:', data.length);
      
      // For now, we'll just store it in AsyncStorage as a demo
      await AsyncStorage.setItem(`@export_${filename}`, data);
      console.log('Export saved successfully');
    } catch (error) {
      console.error('Failed to save export:', error);
      throw new Error('Failed to save export file');
    }
  }

  // Method to generate shareable progress report
  async generateProgressReport(): Promise<string> {
    try {
      const data = await this.gatherAllData();
      
      return `
🏆 MY CONFLICT RESOLUTION JOURNEY

📊 Progress Summary:
• ${data.achievements.totalPoints} Achievement Points
• ${data.achievements.unlockedAchievements.length} Achievements Unlocked
• ${data.sessions.totalSessions} Sessions Completed
• ${data.analytics.streakDays} Day Streak
• ${data.analytics.improvementScore}/100 Improvement Score

🎯 Recent Achievements:
${data.achievements.unlockedAchievements.slice(-3).map(a => `• ${a.title}`).join('\n')}

💪 Skills Developed:
${data.analytics.skillsUsed.slice(0, 5).map(skill => `• ${skill}`).join('\n')}

📈 Growth Metrics:
• Average Session Rating: ${data.sessions.averageRating.toFixed(1)}/5
• Total Practice Time: ${data.sessions.totalDuration} minutes
• Member Since: ${data.analytics.joinDate.toLocaleDateString()}

Generated by understand.me - Your conflict resolution companion
      `.trim();
    } catch (error) {
      console.error('Failed to generate progress report:', error);
      throw new Error('Failed to generate progress report');
    }
  }
}

export const dataExportService = new DataExportService();
export default dataExportService;
