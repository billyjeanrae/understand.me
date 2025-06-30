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
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mic, Volume2, Settings } from 'lucide-react-native';
import { getAvailableVoices, isTTSAvailable, isSTTAvailable } from '../services/ai/tts';
import { getSupportedLanguages } from '../services/ai/stt';

interface VoiceSettings {
  ttsEnabled: boolean;
  sttEnabled: boolean;
  selectedVoice: string;
  selectedLanguage: string;
  speechSpeed: number;
  autoSpeak: boolean;
}

export default function VoiceSettingsScreen() {
  const [settings, setSettings] = useState<VoiceSettings>({
    ttsEnabled: true,
    sttEnabled: true,
    selectedVoice: 'pNInz6obpgDQGcFmaJgB', // Default Adam voice
    selectedLanguage: 'en-US',
    speechSpeed: 1.0,
    autoSpeak: true,
  });

  const [availableVoices, setAvailableVoices] = useState<Array<{ id: string; name: string; language: string }>>([]);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);

  useEffect(() => {
    // Load available voices and languages
    setAvailableVoices(getAvailableVoices());
    setSupportedLanguages(getSupportedLanguages());
  }, []);

  const handleSettingChange = (key: keyof VoiceSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: Save to AsyncStorage or user preferences
  };

  const testVoice = async () => {
    try {
      // TODO: Implement voice test using selected voice
      Alert.alert('Voice Test', 'This feature will be implemented with the selected voice.');
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

  const speedOptions = [
    { value: 0.5, label: 'Very Slow' },
    { value: 0.75, label: 'Slow' },
    { value: 1.0, label: 'Normal' },
    { value: 1.25, label: 'Fast' },
    { value: 1.5, label: 'Very Fast' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <Pressable style={styles.backButton}>
          <ArrowLeft size={24} color="#F1F5F9" strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Voice Settings</Text>
        <Pressable style={styles.resetButton} onPress={resetToDefaults}>
          <Settings size={20} color="#94A3B8" strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Feature Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Availability</Text>
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityItem}>
              <Mic size={16} color={isSTTAvailable() ? "#10B981" : "#EF4444"} strokeWidth={2} />
              <Text style={styles.availabilityText}>
                Speech-to-Text: {isSTTAvailable() ? 'Available' : 'Not Available'}
              </Text>
            </View>
            <View style={styles.availabilityItem}>
              <Volume2 size={16} color={isTTSAvailable() ? "#10B981" : "#EF4444"} strokeWidth={2} />
              <Text style={styles.availabilityText}>
                Text-to-Speech: {isTTSAvailable() ? 'Available' : 'Not Available'}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Text-to-Speech</Text>
              <Text style={styles.settingDescription}>
                Allow Udine to speak responses aloud
              </Text>
            </View>
            <Switch
              value={settings.ttsEnabled}
              onValueChange={(value) => handleSettingChange('ttsEnabled', value)}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={settings.ttsEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Speech-to-Text</Text>
              <Text style={styles.settingDescription}>
                Allow voice input to Udine
              </Text>
            </View>
            <Switch
              value={settings.sttEnabled}
              onValueChange={(value) => handleSettingChange('sttEnabled', value)}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={settings.sttEnabled ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-speak Responses</Text>
              <Text style={styles.settingDescription}>
                Automatically speak AI responses after voice input
              </Text>
            </View>
            <Switch
              value={settings.autoSpeak}
              onValueChange={(value) => handleSettingChange('autoSpeak', value)}
              trackColor={{ false: '#374151', true: '#3B82F6' }}
              thumbColor={settings.autoSpeak ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Voice Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Selection</Text>
          <Text style={styles.sectionDescription}>
            Choose the voice for Udine's responses
          </Text>
          
          {availableVoices.map((voice) => (
            <Pressable
              key={voice.id}
              style={[
                styles.voiceOption,
                settings.selectedVoice === voice.id && styles.selectedVoiceOption,
              ]}
              onPress={() => handleSettingChange('selectedVoice', voice.id)}
            >
              <View style={styles.voiceInfo}>
                <Text style={[
                  styles.voiceName,
                  settings.selectedVoice === voice.id && styles.selectedVoiceText,
                ]}>
                  {voice.name}
                </Text>
                <Text style={styles.voiceLanguage}>{voice.language}</Text>
              </View>
              <View style={[
                styles.radio,
                settings.selectedVoice === voice.id && styles.radioSelected,
              ]} />
            </Pressable>
          ))}

          <Pressable style={styles.testButton} onPress={testVoice}>
            <Volume2 size={16} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.testButtonText}>Test Selected Voice</Text>
          </Pressable>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <Text style={styles.sectionDescription}>
            Choose the language for speech recognition
          </Text>
          
          {supportedLanguages.slice(0, 6).map((language) => (
            <Pressable
              key={language}
              style={[
                styles.languageOption,
                settings.selectedLanguage === language && styles.selectedLanguageOption,
              ]}
              onPress={() => handleSettingChange('selectedLanguage', language)}
            >
              <Text style={[
                styles.languageText,
                settings.selectedLanguage === language && styles.selectedLanguageText,
              ]}>
                {getLanguageDisplayName(language)}
              </Text>
              <View style={[
                styles.radio,
                settings.selectedLanguage === language && styles.radioSelected,
              ]} />
            </Pressable>
          ))}
        </View>

        {/* Speech Speed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Speech Speed</Text>
          <Text style={styles.sectionDescription}>
            Adjust how fast Udine speaks
          </Text>
          
          {speedOptions.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.speedOption,
                settings.speechSpeed === option.value && styles.selectedSpeedOption,
              ]}
              onPress={() => handleSettingChange('speechSpeed', option.value)}
            >
              <Text style={[
                styles.speedText,
                settings.speechSpeed === option.value && styles.selectedSpeedText,
              ]}>
                {option.label}
              </Text>
              <View style={[
                styles.radio,
                settings.speechSpeed === option.value && styles.radioSelected,
              ]} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getLanguageDisplayName(code: string): string {
  const languageNames: Record<string, string> = {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es-ES': 'Spanish (Spain)',
    'es-MX': 'Spanish (Mexico)',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'pt-BR': 'Portuguese (Brazil)',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
  };
  return languageNames[code] || code;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  availabilityContainer: {
    gap: 12,
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedVoiceOption: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  selectedVoiceText: {
    color: '#3B82F6',
  },
  voiceLanguage: {
    fontSize: 14,
    color: '#94A3B8',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedLanguageOption: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  languageText: {
    fontSize: 16,
    color: '#F1F5F9',
  },
  selectedLanguageText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  speedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedSpeedOption: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  speedText: {
    fontSize: 16,
    color: '#F1F5F9',
  },
  selectedSpeedText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  radioSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

