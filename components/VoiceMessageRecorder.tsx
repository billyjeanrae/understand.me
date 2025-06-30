import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { useResponsive } from '../utils/platform';
import { PlatformUtils } from '../utils/platform';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  Send,
  Square,
  Volume2
} from 'lucide-react-native';

interface VoiceMessageRecorderProps {
  onSend: (voiceData: VoiceMessageData) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
}

interface VoiceMessageData {
  id: string;
  duration: number;
  audioUri: string;
  waveform: number[];
  timestamp: Date;
}

export default function VoiceMessageRecorder({ 
  onSend, 
  onCancel, 
  maxDuration = 300 
}: VoiceMessageRecorderProps) {
  const { spacing, fontSize } = useResponsive();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const playbackTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (playbackTimer.current) clearInterval(playbackTimer.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      startPulseAnimation();
      startRecordingTimer();
    } else {
      stopPulseAnimation();
      stopRecordingTimer();
    }
  }, [isRecording, isPaused]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRecordingTimer = () => {
    recordingTimer.current = setInterval(() => {
      setDuration(prev => {
        const newDuration = prev + 0.1;
        
        // Add random waveform data
        setWaveform(prevWaveform => {
          const newWaveform = [...prevWaveform];
          if (newWaveform.length > 100) {
            newWaveform.shift();
          }
          newWaveform.push(Math.random() * 0.8 + 0.2);
          return newWaveform;
        });
        
        // Auto-stop at max duration
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        
        return newDuration;
      });
    }, 100);
  };

  const stopRecordingTimer = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
  };

  const startRecording = async () => {
    try {
      // Platform-specific recording implementation
      if (PlatformUtils.isWeb) {
        // Web implementation using MediaRecorder API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          Alert.alert('Error', 'Voice recording is not supported in this browser.');
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // TODO: Implement MediaRecorder setup
        console.log('Web recording started');
      } else {
        // Mobile implementation
        // TODO: Use expo-av or react-native-audio-recorder-player
        console.log('Mobile recording started');
        if (Platform.OS !== 'web') {
          Vibration.vibrate(50);
        }
      }
      
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setWaveform([]);
      setAudioUri(`recording_${Date.now()}.${PlatformUtils.isWeb ? 'webm' : 'm4a'}`);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const pauseRecording = () => {
    setIsPaused(true);
    // TODO: Pause actual recording
  };

  const resumeRecording = () => {
    setIsPaused(false);
    // TODO: Resume actual recording
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    stopRecordingTimer();
    
    // Platform-specific stop recording
    if (PlatformUtils.isWeb) {
      // TODO: Stop MediaRecorder and get blob
      console.log('Web recording stopped');
    } else {
      // TODO: Stop mobile recording
      console.log('Mobile recording stopped');
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }
    }
  };

  const playRecording = async () => {
    if (!audioUri) return;
    
    try {
      setIsPlaying(true);
      setPlaybackPosition(0);
      
      // TODO: Play actual audio file
      // Simulate playback
      playbackTimer.current = setInterval(() => {
        setPlaybackPosition(prev => {
          const newPosition = prev + 0.1;
          if (newPosition >= duration) {
            stopPlayback();
            return duration;
          }
          return newPosition;
        });
      }, 100);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to play recording.');
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setPlaybackPosition(0);
    if (playbackTimer.current) {
      clearInterval(playbackTimer.current);
      playbackTimer.current = null;
    }
    // TODO: Stop actual audio playback
  };

  const deleteRecording = () => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this voice message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDuration(0);
            setWaveform([]);
            setAudioUri(null);
            setPlaybackPosition(0);
            onCancel();
          }
        }
      ]
    );
  };

  const sendVoiceMessage = () => {
    if (!audioUri || duration < 1) {
      Alert.alert('Error', 'Recording is too short. Minimum duration is 1 second.');
      return;
    }

    const voiceData: VoiceMessageData = {
      id: `voice_${Date.now()}`,
      duration,
      audioUri,
      waveform,
      timestamp: new Date(),
    };

    onSend(voiceData);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => {
    const maxBars = 40;
    const displayWaveform = waveform.slice(-maxBars);
    
    return (
      <View style={styles.waveformContainer}>
        {Array.from({ length: maxBars }).map((_, index) => {
          const height = displayWaveform[index] || 0;
          const isActive = isPlaying && (playbackPosition / duration) * maxBars > index;
          
          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: Math.max(height * 40, 2),
                  backgroundColor: isActive ? '#3B82F6' : '#6B7280',
                  opacity: displayWaveform[index] ? 1 : 0.3,
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  if (!isRecording && !audioUri) {
    // Initial state - show record button
    return (
      <View style={[styles.container, { padding: spacing(16) }]}>
        <TouchableOpacity
          style={[styles.recordButton, { padding: spacing(20) }]}
          onPress={startRecording}
          onLongPress={startRecording}
        >
          <Mic size={32} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        
        <Text style={[styles.instructionText, { fontSize: fontSize(12) }]}>
          Tap to record voice message
        </Text>
      </View>
    );
  }

  if (isRecording) {
    // Recording state
    return (
      <View style={[styles.recordingContainer, { padding: spacing(16) }]}>
        <View style={styles.recordingHeader}>
          <View style={styles.recordingIndicator}>
            <View style={[styles.recordingDot, { opacity: isPaused ? 0.5 : 1 }]} />
            <Text style={[styles.recordingText, { fontSize: fontSize(14) }]}>
              {isPaused ? 'Paused' : 'Recording'}
            </Text>
          </View>
          
          <Text style={[styles.durationText, { fontSize: fontSize(16) }]}>
            {formatDuration(duration)}
          </Text>
        </View>

        {renderWaveform()}

        <View style={styles.recordingControls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.deleteButton, { padding: spacing(12) }]}
            onPress={() => {
              stopRecording();
              onCancel();
            }}
          >
            <Trash2 size={20} color="#EF4444" strokeWidth={2} />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton, { padding: spacing(16) }]}
              onPress={isPaused ? resumeRecording : pauseRecording}
            >
              {isPaused ? (
                <Mic size={24} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Square size={20} color="#FFFFFF" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton, { padding: spacing(12) }]}
            onPress={stopRecording}
          >
            <Square size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Playback state - recording finished
  return (
    <View style={[styles.playbackContainer, { padding: spacing(16) }]}>
      <View style={styles.playbackHeader}>
        <Volume2 size={20} color="#3B82F6" strokeWidth={2} />
        <Text style={[styles.playbackTitle, { fontSize: fontSize(14) }]}>
          Voice Message
        </Text>
        <Text style={[styles.durationText, { fontSize: fontSize(12) }]}>
          {formatDuration(playbackPosition)} / {formatDuration(duration)}
        </Text>
      </View>

      {renderWaveform()}

      <View style={styles.playbackControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.deleteButton, { padding: spacing(12) }]}
          onPress={deleteRecording}
        >
          <Trash2 size={20} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.playButton, { padding: spacing(16) }]}
          onPress={isPlaying ? stopPlayback : playRecording}
        >
          {isPlaying ? (
            <Pause size={24} color="#FFFFFF" strokeWidth={2} />
          ) : (
            <Play size={24} color="#FFFFFF" strokeWidth={2} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.sendButton, { padding: spacing(12) }]}
          onPress={sendVoiceMessage}
        >
          <Send size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  instructionText: {
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  recordingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    color: '#EF4444',
    fontFamily: 'Inter-SemiBold',
  },
  durationText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    marginVertical: 16,
    gap: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: '#6B7280',
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  playbackTitle: {
    color: '#3B82F6',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  stopButton: {
    backgroundColor: '#6B7280',
  },
  playButton: {
    backgroundColor: '#3B82F6',
  },
  sendButton: {
    backgroundColor: '#10B981',
  },
});
