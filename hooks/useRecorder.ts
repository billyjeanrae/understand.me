import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface RecorderState {
  isRecording: boolean;
  isLoading: boolean;
  duration: number;
  uri: string | null;
}

interface UseRecorderReturn {
  state: RecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  playRecording: () => Promise<void>;
  clearRecording: () => void;
}

/**
 * Custom hook for recording audio across platforms
 * Handles microphone permissions and audio recording functionality
 */
export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isLoading: false,
    duration: 0,
    uri: null,
  });

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // For web, use navigator.mediaDevices
        await navigator.mediaDevices.getUserMedia({ audio: true });
        return true;
      } else {
        // For mobile platforms
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  const startRecording = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;

      // Start duration tracking
      let duration = 0;
      durationInterval.current = setInterval(() => {
        duration += 100;
        setState(prev => ({ ...prev, duration }));
      }, 100);

      setState(prev => ({
        ...prev,
        isRecording: true,
        isLoading: false,
        duration: 0,
      }));
    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      if (!recordingRef.current) {
        return null;
      }

      setState(prev => ({ ...prev, isLoading: true }));

      // Stop duration tracking
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      setState(prev => ({
        ...prev,
        isRecording: false,
        isLoading: false,
        uri,
      }));

      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isLoading: false 
      }));
      throw error;
    }
  };

  const playRecording = async (): Promise<void> => {
    try {
      if (!state.uri) {
        return;
      }

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Create and play new sound
      const { sound } = await Audio.Sound.createAsync({ uri: state.uri });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play recording:', error);
      throw error;
    }
  };

  const clearRecording = (): void => {
    setState(prev => ({
      ...prev,
      uri: null,
      duration: 0,
    }));

    if (soundRef.current) {
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  return {
    state,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording,
  };
}

