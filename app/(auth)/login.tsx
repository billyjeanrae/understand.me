import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { ResponsiveLayout } from '../../components/layout/ResponsiveLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, isLoading } = useAuthStore();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validation
    let hasErrors = false;

    if (!email) {
      setEmailError('Email is required');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      await login(email, password);
      router.replace('/(main)/dashboard');
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
    Alert.alert('Forgot Password', 'This feature will be available soon.');
  };

  return (
    <ResponsiveLayout>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your conflict resolution journey
            </Text>
          </View>

          <Card style={styles.card}>
            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={emailError}
                leftIcon={<Mail size={20} color={Colors.text.tertiary} />}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoComplete="password"
                error={passwordError}
                leftIcon={<Lock size={20} color={Colors.text.tertiary} />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={Colors.text.tertiary} />
                    ) : (
                      <Eye size={20} color={Colors.text.tertiary} />
                    )}
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
                fullWidth
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Create New Account"
                onPress={handleSignUp}
                variant="outline"
                fullWidth
              />
            </View>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  
  title: {
    ...Typography.styles.h1,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  subtitle: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  
  form: {
    gap: Spacing.md,
  },
  
  eyeButton: {
    padding: Spacing.xs,
  },
  
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  
  forgotPasswordText: {
    ...Typography.styles.caption,
    color: Colors.primary[500],
  },
  
  loginButton: {
    marginTop: Spacing.sm,
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  
  dividerText: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.md,
  },
  
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  footerText: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

