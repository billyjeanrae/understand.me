import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Achievement } from '../../types/achievements';
import { useResponsive } from '../../utils/platform';
import { ResponsiveCard } from '../layout/ResponsiveContainer';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

export default function AchievementBadge({ 
  achievement, 
  size = 'medium', 
  showProgress = false 
}: AchievementBadgeProps) {
  const { spacing, fontSize, isWeb } = useResponsive();

  const getDifficultyColor = (difficulty: Achievement['difficulty']) => {
    switch (difficulty) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#6B7280';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 80, height: 80 },
          icon: { fontSize: fontSize(24) },
          title: { fontSize: fontSize(10) },
          points: { fontSize: fontSize(8) },
        };
      case 'large':
        return {
          container: { width: 120, height: 120 },
          icon: { fontSize: fontSize(40) },
          title: { fontSize: fontSize(14) },
          points: { fontSize: fontSize(12) },
        };
      default: // medium
        return {
          container: { width: 100, height: 100 },
          icon: { fontSize: fontSize(32) },
          title: { fontSize: fontSize(12) },
          points: { fontSize: fontSize(10) },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const difficultyColor = getDifficultyColor(achievement.difficulty);

  return (
    <ResponsiveCard
      style={StyleSheet.flatten([
        styles.container,
        sizeStyles.container,
        {
          borderColor: achievement.isUnlocked ? difficultyColor : '#374151',
          backgroundColor: achievement.isUnlocked 
            ? `${difficultyColor}20` 
            : 'rgba(55, 65, 81, 0.5)',
          opacity: achievement.isUnlocked ? 1 : 0.6,
        },
        ...(achievement.isNew ? [styles.newBadge] : []),
      ])}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, sizeStyles.icon]}>
          {achievement.icon}
        </Text>
        
        <Text 
          style={[
            styles.title, 
            sizeStyles.title,
            { color: achievement.isUnlocked ? '#FFFFFF' : '#9CA3AF' }
          ]}
          numberOfLines={2}
        >
          {achievement.title}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.points, sizeStyles.points]}>
            {achievement.points} pts
          </Text>
          
          {showProgress && !achievement.isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${achievement.progress}%`,
                      backgroundColor: difficultyColor,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(achievement.progress)}%
              </Text>
            </View>
          )}
        </View>

        {achievement.isNew && (
          <View style={styles.newIndicator}>
            <Text style={styles.newText}>NEW!</Text>
          </View>
        )}
      </View>
    </ResponsiveCard>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 8,
    margin: 4,
    position: 'relative',
  },
  newBadge: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  points: {
    color: '#10B981',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 4,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  newIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Inter-Bold',
  },
});
