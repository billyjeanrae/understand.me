/**
 * Digital Sign-off Service
 * Handles digital agreement creation, signing, and management for conflict resolutions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatWithUdine } from '../ai/chat';

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

class DigitalSignoffService {
  private readonly STORAGE_KEY = 'digital_agreements';
  private readonly TEMPLATES_KEY = 'agreement_templates';

  /**
   * Generate an agreement based on session conversation
   */
  async generateAgreementFromSession(
    sessionId: string,
    messages: any[],
    conflictType: string = 'general'
  ): Promise<DigitalAgreement> {
    const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const prompt = `
      Based on this conflict resolution session, generate a formal agreement document:
      
      ${conversation}
      
      Create a structured agreement with:
      1. A clear title
      2. Main agreement content (2-3 paragraphs)
      3. Specific terms and commitments (3-5 items)
      
      Format as JSON with:
      {
        "title": "Agreement title",
        "content": "Main agreement text",
        "terms": [
          {
            "description": "Specific commitment or term",
            "category": "commitment|boundary|action|timeline|communication",
            "priority": "high|medium|low"
          }
        ],
        "resolutionSummary": "Brief summary of what was resolved"
      }
    `;

    try {
      const response = await chatWithUdine([], prompt);
      const aiGenerated = JSON.parse(response);
      
      const agreement: DigitalAgreement = {
        id: `agreement_${Date.now()}`,
        sessionId,
        title: aiGenerated.title || 'Conflict Resolution Agreement',
        content: aiGenerated.content || 'This agreement represents the mutual understanding reached during our conflict resolution session.',
        terms: aiGenerated.terms?.map((term: any, index: number) => ({
          id: `term_${index}`,
          description: term.description,
          category: term.category || 'commitment',
          priority: term.priority || 'medium'
        })) || [],
        participants: [
          {
            id: 'participant_1',
            name: 'Participant',
            role: 'primary'
          }
        ],
        status: 'draft',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        metadata: {
          conflictType,
          resolutionSummary: aiGenerated.resolutionSummary || 'Conflict resolution completed',
          aiGenerated: true
        }
      };

      await this.saveAgreement(agreement);
      return agreement;
    } catch (error) {
      console.error('Failed to generate agreement:', error);
      
      // Fallback to template-based agreement
      return this.createTemplateAgreement(sessionId, conflictType);
    }
  }

  /**
   * Create agreement from template
   */
  async createTemplateAgreement(
    sessionId: string,
    conflictType: string
  ): Promise<DigitalAgreement> {
    const template = await this.getTemplateByCategory(conflictType);
    
    const agreement: DigitalAgreement = {
      id: `agreement_${Date.now()}`,
      sessionId,
      title: template.name,
      content: template.template,
      terms: template.defaultTerms.map((term, index) => ({
        id: `term_${index}`,
        ...term
      })),
      participants: [
        {
          id: 'participant_1',
          name: 'Participant',
          role: 'primary'
        }
      ],
      status: 'draft',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: {
        conflictType,
        resolutionSummary: 'Agreement created from template',
        aiGenerated: false
      }
    };

    await this.saveAgreement(agreement);
    return agreement;
  }

  /**
   * Sign an agreement
   */
  async signAgreement(
    agreementId: string,
    participantId: string,
    signature: DigitalSignature
  ): Promise<DigitalAgreement> {
    const agreement = await this.getAgreement(agreementId);
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    if (agreement.status === 'signed') {
      throw new Error('Agreement already signed');
    }

    if (agreement.expiresAt && new Date() > agreement.expiresAt) {
      throw new Error('Agreement has expired');
    }

    // Update participant signature
    const participantIndex = agreement.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error('Participant not found');
    }

    agreement.participants[participantIndex].signedAt = new Date();
    agreement.participants[participantIndex].signature = signature;

    // Check if all required participants have signed
    const allSigned = agreement.participants
      .filter(p => p.role === 'primary')
      .every(p => p.signedAt);

    if (allSigned) {
      agreement.status = 'signed';
      agreement.signedAt = new Date();
    }

    await this.saveAgreement(agreement);
    return agreement;
  }

  /**
   * Update agreement terms
   */
  async updateAgreementTerms(
    agreementId: string,
    terms: AgreementTerm[]
  ): Promise<DigitalAgreement> {
    const agreement = await this.getAgreement(agreementId);
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    if (agreement.status === 'signed') {
      throw new Error('Cannot modify signed agreement');
    }

    agreement.terms = terms;
    await this.saveAgreement(agreement);
    return agreement;
  }

  /**
   * Add participant to agreement
   */
  async addParticipant(
    agreementId: string,
    participant: Omit<AgreementParticipant, 'id'>
  ): Promise<DigitalAgreement> {
    const agreement = await this.getAgreement(agreementId);
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    const newParticipant: AgreementParticipant = {
      id: `participant_${Date.now()}`,
      ...participant
    };

    agreement.participants.push(newParticipant);
    await this.saveAgreement(agreement);
    return agreement;
  }

  /**
   * Get agreement by ID
   */
  async getAgreement(agreementId: string): Promise<DigitalAgreement | null> {
    try {
      const agreements = await this.getAllAgreements();
      return agreements.find(a => a.id === agreementId) || null;
    } catch (error) {
      console.error('Failed to get agreement:', error);
      return null;
    }
  }

  /**
   * Get all agreements
   */
  async getAllAgreements(): Promise<DigitalAgreement[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const agreements = JSON.parse(stored);
      return agreements.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        expiresAt: a.expiresAt ? new Date(a.expiresAt) : undefined,
        signedAt: a.signedAt ? new Date(a.signedAt) : undefined,
        participants: a.participants.map((p: any) => ({
          ...p,
          signedAt: p.signedAt ? new Date(p.signedAt) : undefined,
          signature: p.signature ? {
            ...p.signature,
            timestamp: new Date(p.signature.timestamp)
          } : undefined
        }))
      }));
    } catch (error) {
      console.error('Failed to get agreements:', error);
      return [];
    }
  }

  /**
   * Get agreements by session
   */
  async getAgreementsBySession(sessionId: string): Promise<DigitalAgreement[]> {
    const agreements = await this.getAllAgreements();
    return agreements.filter(a => a.sessionId === sessionId);
  }

  /**
   * Save agreement to storage
   */
  private async saveAgreement(agreement: DigitalAgreement): Promise<void> {
    try {
      const agreements = await this.getAllAgreements();
      const existingIndex = agreements.findIndex(a => a.id === agreement.id);
      
      if (existingIndex >= 0) {
        agreements[existingIndex] = agreement;
      } else {
        agreements.push(agreement);
      }
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(agreements));
    } catch (error) {
      console.error('Failed to save agreement:', error);
      throw new Error('Failed to save agreement');
    }
  }

  /**
   * Delete agreement
   */
  async deleteAgreement(agreementId: string): Promise<void> {
    try {
      const agreements = await this.getAllAgreements();
      const filtered = agreements.filter(a => a.id !== agreementId);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete agreement:', error);
      throw new Error('Failed to delete agreement');
    }
  }

  /**
   * Get agreement templates
   */
  async getTemplates(): Promise<AgreementTemplate[]> {
    try {
      const stored = await AsyncStorage.getItem(this.TEMPLATES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default templates if none stored
      const defaultTemplates = this.getDefaultTemplates();
      await AsyncStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(defaultTemplates));
      return defaultTemplates;
    } catch (error) {
      console.error('Failed to get templates:', error);
      return this.getDefaultTemplates();
    }
  }

  /**
   * Get template by category
   */
  async getTemplateByCategory(category: string): Promise<AgreementTemplate> {
    const templates = await this.getTemplates();
    return templates.find(t => t.category === category) || templates[0];
  }

  /**
   * Export agreement as text
   */
  async exportAgreement(agreementId: string, format: 'text' | 'json' = 'text'): Promise<string> {
    const agreement = await this.getAgreement(agreementId);
    if (!agreement) {
      throw new Error('Agreement not found');
    }

    if (format === 'json') {
      return JSON.stringify(agreement, null, 2);
    }

    return this.formatAgreementAsText(agreement);
  }

  /**
   * Format agreement as readable text
   */
  private formatAgreementAsText(agreement: DigitalAgreement): string {
    const signedParticipants = agreement.participants.filter(p => p.signedAt);
    
    return `
DIGITAL CONFLICT RESOLUTION AGREEMENT
====================================

Agreement ID: ${agreement.id}
Session ID: ${agreement.sessionId}
Created: ${agreement.createdAt.toLocaleDateString()}
Status: ${agreement.status.toUpperCase()}
${agreement.signedAt ? `Signed: ${agreement.signedAt.toLocaleDateString()}` : ''}

TITLE
-----
${agreement.title}

AGREEMENT
---------
${agreement.content}

TERMS AND COMMITMENTS
--------------------
${agreement.terms.map((term, i) => `
${i + 1}. ${term.description}
   Category: ${term.category}
   Priority: ${term.priority}
   ${term.assignedTo ? `Assigned to: ${term.assignedTo}` : ''}
   ${term.dueDate ? `Due: ${term.dueDate.toLocaleDateString()}` : ''}
`).join('')}

PARTICIPANTS
-----------
${agreement.participants.map(p => `
${p.name} (${p.role})
${p.email ? `Email: ${p.email}` : ''}
${p.signedAt ? `Signed: ${p.signedAt.toLocaleDateString()}` : 'Not signed'}
${p.signature ? `Signature Type: ${p.signature.type}` : ''}
`).join('')}

SIGNATURES
----------
${signedParticipants.length > 0 ? 
  signedParticipants.map(p => `
${p.name}: Signed on ${p.signedAt?.toLocaleDateString()} at ${p.signedAt?.toLocaleTimeString()}
Signature: ${p.signature?.type === 'typed' ? p.signature.data : '[Digital Signature]'}
`).join('') : 
  'No signatures yet'
}

This agreement was ${agreement.metadata.aiGenerated ? 'AI-generated' : 'template-based'} 
based on the conflict resolution session.

Resolution Summary: ${agreement.metadata.resolutionSummary}
    `.trim();
  }

  /**
   * Get default agreement templates
   */
  private getDefaultTemplates(): AgreementTemplate[] {
    return [
      {
        id: 'general',
        name: 'General Conflict Resolution Agreement',
        description: 'Standard agreement for general conflicts',
        category: 'general',
        template: 'We, the participants in this conflict resolution session, agree to the following terms and commitments to resolve our differences and move forward constructively.',
        defaultTerms: [
          {
            description: 'Commit to respectful communication in future interactions',
            category: 'communication',
            priority: 'high'
          },
          {
            description: 'Acknowledge each other\'s perspectives and feelings',
            category: 'commitment',
            priority: 'high'
          },
          {
            description: 'Implement agreed-upon solutions within the specified timeframe',
            category: 'action',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'workplace',
        name: 'Workplace Conflict Resolution Agreement',
        description: 'Agreement template for workplace conflicts',
        category: 'workplace',
        template: 'As colleagues committed to a positive work environment, we agree to resolve our workplace conflict through the following commitments and actions.',
        defaultTerms: [
          {
            description: 'Maintain professional communication at all times',
            category: 'communication',
            priority: 'high'
          },
          {
            description: 'Respect established workplace boundaries and procedures',
            category: 'boundary',
            priority: 'high'
          },
          {
            description: 'Schedule regular check-ins to ensure continued progress',
            category: 'timeline',
            priority: 'medium'
          }
        ]
      },
      {
        id: 'personal',
        name: 'Personal Relationship Agreement',
        description: 'Agreement template for personal relationship conflicts',
        category: 'personal',
        template: 'In the spirit of preserving and strengthening our relationship, we commit to the following agreements and actions.',
        defaultTerms: [
          {
            description: 'Practice active listening and empathy in our communications',
            category: 'communication',
            priority: 'high'
          },
          {
            description: 'Respect each other\'s personal boundaries and needs',
            category: 'boundary',
            priority: 'high'
          },
          {
            description: 'Address future concerns promptly and constructively',
            category: 'commitment',
            priority: 'medium'
          }
        ]
      }
    ];
  }

  /**
   * Validate digital signature
   */
  validateSignature(signature: DigitalSignature): boolean {
    if (!signature.data || !signature.timestamp) {
      return false;
    }

    // Basic validation - in production, you might want more sophisticated validation
    if (signature.type === 'typed') {
      return signature.data.length >= 2; // At least 2 characters for typed name
    }

    if (signature.type === 'drawn') {
      return signature.data.startsWith('data:image/'); // Base64 image data
    }

    return true;
  }
}

export const digitalSignoffService = new DigitalSignoffService();
export default digitalSignoffService;

