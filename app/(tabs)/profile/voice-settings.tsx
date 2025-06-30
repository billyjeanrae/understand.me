import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useResponsive } from '../../../utils/platform';
import { ResponsiveContainer } from '../../../components/layout/ResponsiveContainer';
import { ArrowLeft, Mic, Volume2, Settings, Play, TestTube } from 'lucide-react-native';

interface VoiceSettings {
  ttsEnabled: boolean;
  sttEnabled: boolean;
  selectedVoice: string;
  selectedLanguage: string;
  speechSpeed: number;
  autoSpeak: boolean;
}

interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  description: string;
}

export default function VoiceSettingsScreen() {
  const { spacing, fontSize } = useResponsive();
  const router = useRouter();
  const [settings, setSettings] = useState<VoiceSettings>({
    ttsEnabled: true,
    sttEnabled: true,
    selectedVoice: 'pNInz6obpgDQGcFmaJgB', // Default Adam voice
    selectedLanguage: 'en-US',
    speechSpeed: 1.0,
    autoSpeak: true,
  });

  const [availableVoices] = useState<VoiceOption[]>([
    {
      id: 'pNInz6obpgDQGcFmaJgB',
      name: 'Adam',
      language: 'en-US',
      gender: 'male',
      description: 'Deep, authoritative voice perfect for mediation'
    },
    {
      id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Bella',
      language: 'en-US',
      gender: 'female',
      description: 'Warm, empathetic voice ideal for conflict resolution'
    },
    {
      id: 'VR6AewLTigWG4xSOukaG',
      name: 'Arnold',
      language: 'en-US',
      gender: 'male',
      description: 'Calm, reassuring voice for difficult conversations'
    },
    {
      id: 'MF3mGyEYCl7XYWbV9V6O',
      name: 'Elli',
      language: 'en-US',
      gender: 'female',
      description: 'Clear, professional voice for structured mediation'
    }
  ]);

  const [supportedLanguages] = useState<string[]>([
    'en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ja-JP', 'ko-KR', 'zh-CN'
  ]);

  const speedOptions = [
    { value: 0.5, label: '0.5x (Very Slow)' },
    { value: 0.75, label: '0.75x (Slow)' },
    { value: 1.0, label: '1.0x (Normal)' },
    { value: 1.25, label: '1.25x (Fast)' },
    { value: 1.5, label: '1.5x (Very Fast)' },
  ];

  const handleSettingChange = (key: keyof VoiceSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: Save to AsyncStorage or user preferences
  };

  const testVoice = async (voiceId?: string) => {
    try {
      const testText = "Hello! This is how I sound when providing conflict resolution guidance. I'm here to help you navigate difficult conversations with empathy and understanding.";
      Alert.alert(
        'Voice Test', 
        `Testing voice: ${availableVoices.find(v => v.id === (voiceId || settings.selectedVoice))?.name}\n\nText: "${testText}"\n\nIn a real implementation, this would play the audio.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test voice. Please try again.');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all voice settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              ttsEnabled: true,
              sttEnabled: true,
              selectedVoice: 'pNInz6obpgDQGcFmaJgB',
              selectedLanguage: 'en-US',
              speechSpeed: 1.0,
              autoSpeak: true,
            });
          },
        },
      ]
    );
  };

  const getLanguageDisplayName = (code: string) => {
    const names: { [key: string]: string } = {
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'pt-BR': 'Portuguese',
      'ja-JP': 'Japanese',
      'ko-KR': 'Korean',
      'zh-CN': 'Chinese'
    };
    return names[code] || code;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ResponsiveContainer style={styles.content}>
          {/* Header */}
          <View style={[styles.header, { marginBottom: spacing(32) }]}>
            <Pressable 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
            <Text style={[styles.title, { fontSize: fontSize(24) }]}>
              Voice Settings
            </Text>
            <Pressable 
              style={styles.resetButton}
              onPress={resetToDefaults}
            >
              <Settings size={20} color="#9CA3AF" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Voice Features Toggle */}
          <View style={[styles.section, { marginBottom: spacing(32) }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
              Voice Features
            </Text>
            
            <View style={[styles.settingItem, { padding: spacing(16) }]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingHeader}>
                  <Mic size={20} color="#3B82F6" strokeWidth={2} />
                  <Text style={[styles.settingLabel, { fontSize: fontSize(16) }]}>
                    Speech Recognition
                  </Text>
                </View>
                <Text style={[styles.settingDescription, { fontSize: fontSize(14) }]}>
                  Allow the app to listen and understand your voice input
                </Text>
              </View>
              <Switch
                value={settings.sttEnabled}
                onValueChange={(value) => handleSettingChange('sttEnabled', value)}
                trackColor={{ false: '#374151', true: '#3B82F6' }}
                thumbColor={settings.sttEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={[styles.settingItem, { padding: spacing(16) }]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingHeader}>
                  <Volume2 size={20} color="#10B981" strokeWidth={2} />
                  <Text style={[styles.settingLabel, { fontSize: fontSize(16) }]}>
                    Text-to-Speech
                  </Text>
                </View>
                <Text style={[styles.settingDescription, { fontSize: fontSize(14) }]}>
                  Enable AI voice responses and guidance
                </Text>
              </View>
              <Switch
                value={settings.ttsEnabled}
                onValueChange={(value) => handleSettingChange('ttsEnabled', value)}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor={settings.ttsEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={[styles.settingItem, { padding: spacing(16) }]}>
              <View style={styles.settingInfo}>
                <View style={styles.settingHeader}>
                  <Play size={20} color="#F59E0B" strokeWidth={2} />
                  <Text style={[styles.settingLabel, { fontSize: fontSize(16) }]}>
                    Auto-Speak Responses
                  </Text>
                </View>
                <Text style={[styles.settingDescription, { fontSize: fontSize(14) }]}>
                  Automatically speak AI responses without manual trigger
                </Text>
              </View>
              <Switch
                value={settings.autoSpeak}
                onValueChange={(value) => handleSettingChange('autoSpeak', value)}
                trackColor={{ false: '#374151', true: '#F59E0B' }}
                thumbColor={settings.autoSpeak ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Voice Selection */}
          {settings.ttsEnabled && (
            <View style={[styles.section, { marginBottom: spacing(32) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
                Voice Selection
              </Text>
              
              <View style={styles.voiceGrid}>
                {availableVoices.map((voice) => (
                  <Pressable
                    key={voice.id}
                    style={[
                      styles.voiceCard,
                      { padding: spacing(16) },
                      settings.selectedVoice === voice.id && styles.selectedVoiceCard,
                    ]}
                    onPress={() => handleSettingChange('selectedVoice', voice.id)}
                  >
                    <View style={styles.voiceHeader}>
                      <Text style={[
                        styles.voiceName,
                        { fontSize: fontSize(16) },
                        settings.selectedVoice === voice.id && styles.selectedVoiceText,
                      ]}>
                        {voice.name}
                      </Text>
                      <Pressable
                        style={styles.testButton}
                        onPress={() => testVoice(voice.id)}
                      >
                        <TestTube size={16} color="#9CA3AF" strokeWidth={2} />
                      </Pressable>
                    </View>
                    <Text style={[styles.voiceDescription, { fontSize: fontSize(12) }]}>
                      {voice.description}
                    </Text>
                    <View style={styles.voiceMeta}>
                      <Text style={[styles.voiceMetaText, { fontSize: fontSize(10) }]}>
                        {voice.gender} • {voice.language}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Speech Speed */}
          {settings.ttsEnabled && (
            <View style={[styles.section, { marginBottom: spacing(32) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
                Speech Speed
              </Text>
              
              <View style={styles.speedOptions}>
                {speedOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.speedOption,
                      { padding: spacing(12) },
                      settings.speechSpeed === option.value && styles.selectedSpeedOption,
                    ]}
                    onPress={() => handleSettingChange('speechSpeed', option.value)}
                  >
                    <Text style={[
                      styles.speedLabel,
                      { fontSize: fontSize(14) },
                      settings.speechSpeed === option.value && styles.selectedSpeedText,
                    ]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Language Selection */}
          {settings.sttEnabled && (
            <View style={[styles.section, { marginBottom: spacing(32) }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize(18) }]}>
                Recognition Language
              </Text>
              
              <View style={styles.languageGrid}>
                {supportedLanguages.map((lang) => (
                  <Pressable
                    key={lang}
                    style={[
                      styles.languageOption,
                      { padding: spacing(12) },
                      settings.selectedLanguage === lang && styles.selectedLanguageOption,
                    ]}
                    onPress={() => handleSettingChange('selectedLanguage', lang)}
                  >
                    <Text style={[
                      styles.languageLabel,
                      { fontSize: fontSize(14) },
                      settings.selectedLanguage === lang && styles.selectedLanguageText,
                    ]}>
                      {getLanguageDisplayName(lang)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Test Voice Button */}
          {settings.ttsEnabled && (
            <View style={[styles.section, { marginBottom: spacing(32) }]}>
              <Pressable 
                style={[styles.testVoiceButton, { padding: spacing(16) }]}
                onPress={() => testVoice()}
              >
                <Play size={20} color="#FFFFFF" strokeWidth={2} />
                <Text style={[styles.testVoiceText, { fontSize: fontSize(16) }]}>
                  Test Current Voice
                </Text>
              </Pressable>
            </View>
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    flex: 1,
    textAlign: 'center',
  },
  resetButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  settingDescription: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  voiceGrid: {
    gap: 12,
  },
  voiceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedVoiceCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceName: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  selectedVoiceText: {
    color: '#3B82F6',
  },
  testButton: {
    padding: 4,
  },
  voiceDescription: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    marginBottom: 8,
  },
  voiceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voiceMetaText: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textTransform: 'uppercase',
  },
  speedOptions: {
    gap: 8,
  },
  speedOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedSpeedOption: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  speedLabel: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  selectedSpeedText: {
    color: '#10B981',
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: '30%',
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  languageLabel: {
    color: '#D1D5DB',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  selectedLanguageText: {
    color: '#8B5CF6',
  },
  testVoiceButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  testVoiceText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});
