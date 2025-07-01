/**
 * Agreement Types
 * Type definitions for digital agreements and sign-offs
 */

export interface DigitalAgreement {
  id: string;
  sessionId: string;
  title: string;
  content: string;
  terms: AgreementTerm[];
  participants: AgreementParticipant[];
  status: 'draft' | 'pending' | 'signed' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  signedAt?: Date;
  metadata: {
    conflictType: string;
    resolutionSummary: string;
    aiGenerated: boolean;
  };
}

export interface AgreementTerm {
  id: string;
  description: string;
  category: 'commitment' | 'boundary' | 'action' | 'timeline' | 'communication';
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  dueDate?: Date;
}

export interface AgreementParticipant {
  id: string;
  name: string;
  email?: string;
  role: 'primary' | 'secondary' | 'witness';
  signedAt?: Date;
  signature?: DigitalSignature;
}

export interface DigitalSignature {
  type: 'typed' | 'drawn' | 'biometric';
  data: string; // Base64 encoded signature data or typed name
  timestamp: Date;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface AgreementTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  defaultTerms: Omit<AgreementTerm, 'id'>[];
}

