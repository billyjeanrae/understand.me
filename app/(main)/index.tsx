import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { LogOut, User as UserIcon } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard } from '../../components/layout/ResponsiveContainer';
import { useResponsive } from '../../utils/platform';

export default function MainDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const { setUser } = useAuthStore();
  const [badgeScale] = useState(new Animated.Value(1));
  const { breakpoint, isWeb, spacing, fontSize } = useResponsive();

  useEffect(() => {
    // Get user profile
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile(user);
      }
    };

    getUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBadgePress = () => {
    // Animate badge on press
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Open Bolt.new link
    Linking.openURL('https://bolt.new/?rid=os72mi');
  };

  return (
    <LinearGradient
      colors={['#4ECDC4', '#44A08D', '#45B7D1']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ResponsiveContainer style={styles.responsiveContainer}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bolt.new Badge */}
          <TouchableOpacity 
            style={[
              styles.boltBadge,
              { 
                top: spacing(isWeb ? 20 : 50),
                right: spacing(20),
                width: spacing(isWeb ? 50 : 60),
                height: spacing(isWeb ? 50 : 60),
              }
            ]} 
            onPress={handleBadgePress}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: badgeScale }] }}>
              <Image
                source={{ uri: 'https://storage.bolt.army/white_circle_360x360.png' }}
                style={[
                  styles.boltBadgeImage,
                  { 
                    width: spacing(isWeb ? 50 : 60),
                    height: spacing(isWeb ? 50 : 60),
                  }
                ]}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Header */}
          <View style={[styles.header, { paddingTop: spacing(isWeb ? 20 : 60) }]}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <UserIcon size={24} color="#fff" />
              </View>
              <View>
                <Text style={[styles.welcomeText, { fontSize: fontSize(14) }]}>Welcome back</Text>
                <Text style={[styles.userName, { fontSize: fontSize(18) }]}>
                  {userProfile?.user_metadata?.full_name || userProfile?.email || 'User'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={[styles.content, { paddingHorizontal: spacing(20) }]}>
            <Text style={[styles.title, { fontSize: fontSize(isWeb ? 36 : 32) }]}>
              Welcome to Understand.me
            </Text>
            <Text style={[styles.subtitle, { fontSize: fontSize(18) }]}>
              Your journey begins here
            </Text>
            
            {/* Stats Grid - Responsive */}
            <ResponsiveGrid
              columns={{ mobile: 3, tablet: 3, desktop: 3 }}
              gap={spacing(12)}
              style={styles.statsGrid}
            >
              <ResponsiveCard style={styles.statCard}>
                <Text style={[styles.statNumber, { fontSize: fontSize(28) }]}>0</Text>
                <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>Sessions</Text>
              </ResponsiveCard>
              <ResponsiveCard style={styles.statCard}>
                <Text style={[styles.statNumber, { fontSize: fontSize(28) }]}>0</Text>
                <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>Conflicts Resolved</Text>
              </ResponsiveCard>
              <ResponsiveCard style={styles.statCard}>
                <Text style={[styles.statNumber, { fontSize: fontSize(28) }]}>0</Text>
                <Text style={[styles.statLabel, { fontSize: fontSize(12) }]}>Growth Points</Text>
              </ResponsiveCard>
            </ResponsiveGrid>

            <TouchableOpacity style={[styles.startButton, { marginTop: spacing(32) }]}>
              <Text style={[styles.startButtonText, { fontSize: fontSize(18) }]}>
                Start New Session
              </Text>
            </TouchableOpacity>

            {/* Hackathon & Sponsors Section */}
            <View style={[styles.hackathonSection, { marginTop: spacing(40) }]}>
              <Text style={[styles.hackathonTitle, { fontSize: fontSize(20) }]}>
                🏆 Built at Bolt.new Hackathon
              </Text>
              <Text style={[styles.hackathonSubtitle, { fontSize: fontSize(14) }]}>
                Powered by cutting-edge AI technology
              </Text>
              
              <View style={styles.sponsorsContainer}>
                <Text style={[styles.sponsorsTitle, { fontSize: fontSize(16) }]}>
                  Our Technology Partners
                </Text>
                
                {/* Sponsors Grid - Responsive */}
                <ResponsiveGrid
                  columns={{ mobile: 2, tablet: 3, desktop: 3 }}
                  gap={spacing(8)}
                  style={styles.sponsorsGrid}
                >
                  <TouchableOpacity 
                    style={styles.sponsorCard}
                    onPress={() => Linking.openURL('https://elevenlabs.io')}
                  >
                    <Image
                      source={{ uri: 'https://elevenlabs.io/favicon.ico' }}
                      style={styles.sponsorLogo}
                      resizeMode="contain"
                    />
                    <Text style={[styles.sponsorName, { fontSize: fontSize(12) }]}>ElevenLabs</Text>
                    <Text style={[styles.sponsorDescription, { fontSize: fontSize(10) }]}>Voice AI</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.sponsorCard}
                    onPress={() => Linking.openURL('https://hume.ai')}
                  >
                    <Image
                      source={{ uri: 'https://hume.ai/favicon.ico' }}
                      style={styles.sponsorLogo}
                      resizeMode="contain"
                    />
                    <Text style={[styles.sponsorName, { fontSize: fontSize(12) }]}>Hume AI</Text>
                    <Text style={[styles.sponsorDescription, { fontSize: fontSize(10) }]}>Emotion Analysis</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.sponsorCard}
                    onPress={() => Linking.openURL('https://supabase.com')}
                  >
                    <Image
                      source={{ uri: 'https://supabase.com/favicon.ico' }}
                      style={styles.sponsorLogo}
                      resizeMode="contain"
                    />
                    <Text style={[styles.sponsorName, { fontSize: fontSize(12) }]}>Supabase</Text>
                    <Text style={[styles.sponsorDescription, { fontSize: fontSize(10) }]}>Database & Auth</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.sponsorCard}
                    onPress={() => Linking.openURL('https://ai.google.dev')}
                  >
                    <Image
                      source={{ uri: 'https://www.google.com/favicon.ico' }}
                      style={styles.sponsorLogo}
                      resizeMode="contain"
                    />
                    <Text style={[styles.sponsorName, { fontSize: fontSize(12) }]}>Google AI</Text>
                    <Text style={[styles.sponsorDescription, { fontSize: fontSize(10) }]}>Gemini Models</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.sponsorCard}
                    onPress={() => Linking.openURL('https://expo.dev')}
                  >
                    <Image
                      source={{ uri: 'https://expo.dev/favicon.ico' }}
                      style={styles.sponsorLogo}
                      resizeMode="contain"
                    />
                    <Text style={[styles.sponsorName, { fontSize: fontSize(12) }]}>Expo</Text>
                    <Text style={[styles.sponsorDescription, { fontSize: fontSize(10) }]}>Mobile Platform</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.sponsorCard}
                    onPress={() => Linking.openURL('https://vercel.com')}
                  >
                    <Image
                      source={{ uri: 'https://vercel.com/favicon.ico' }}
                      style={styles.sponsorLogo}
                      resizeMode="contain"
                    />
                    <Text style={[styles.sponsorName, { fontSize: fontSize(12) }]}>Vercel</Text>
                    <Text style={[styles.sponsorDescription, { fontSize: fontSize(10) }]}>AI SDK</Text>
                  </TouchableOpacity>
                </ResponsiveGrid>
              </View>
            </View>
          </View>
        </ScrollView>
      </ResponsiveContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  responsiveContainer: {
    flex: 1,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  boltBadge: {
    position: 'absolute',
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  boltBadgeImage: {
    borderRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Inter-Regular',
  },
  statsGrid: {
    marginTop: 32,
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'Inter-Regular',
  },
  startButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  hackathonSection: {
    alignItems: 'center',
  },
  hackathonTitle: {
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  hackathonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
  },
  sponsorsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sponsorsTitle: {
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-SemiBold',
  },
  sponsorsGrid: {
    width: '100%',
  },
  sponsorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  sponsorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sponsorLogo: {
    width: 24,
    height: 24,
    marginBottom: 8,
    borderRadius: 4,
  },
  sponsorName: {
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'Inter-SemiBold',
  },
  sponsorDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});
