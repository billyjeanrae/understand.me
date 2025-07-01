/**
 * Resource Types
 * Type definitions for the resource library system
 */

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

