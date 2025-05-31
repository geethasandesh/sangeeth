import React, { useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native';

import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import {KeyboardAvoidingView,Platform,Alert,} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();

  const handleSignupPress = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', "Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      // Navigation is handled automatically by auth state
    } catch (e) {
      Alert.alert('Signup Failed', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Container>
        <Logo>🎵 Sangeeth</Logo>
        <Subtitle>Create Your Free Account Now!</Subtitle>

        <InputWrapper>
          <Ionicons name="mail-outline" size={20} color="#888" />
          <StyledInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
        </InputWrapper>

        <InputWrapper>
          <Ionicons name="lock-closed-outline" size={20} color="#888" />
          <StyledInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="newPassword"
          />
        </InputWrapper>

        <InputWrapper>
          <Ionicons name="lock-closed-outline" size={20} color="#888" />
          <StyledInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
          />
        </InputWrapper>

        <SignupButton onPress={handleSignupPress} activeOpacity={0.8} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <SignupButtonText>Sign Up</SignupButtonText>
          )}
        </SignupButton>

        <LoginText>
          Already have an account?{' '}
          <LoginLink onPress={() => navigation.navigate('Login')}>Login</LoginLink>
        </LoginText>
      </Container>
    </KeyboardAvoidingView>
  );
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 40px 20px;
  background-color: #ffffff;
`;

const Logo = styled.Text`
  font-size: 36px;
  font-weight: bold;
  color: rgb(0, 0, 0);
  text-align: center;
  margin-bottom: 40px;
`;

const Subtitle = styled.Text`
  font-size: 18px;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 500;
`;

const InputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f2f2f2;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  margin-left: 10px;
  font-size: 16px;
  color: #333;
`;

const SignupButton = styled.TouchableOpacity`
  background-color: rgb(0, 0, 0);
  padding: 14px;
  border-radius: 10px;
  margin-top: 10px;
  justify-content: center;
  align-items: center;
`;

const SignupButtonText = styled.Text`
  color: white;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
`;

const LoginText = styled.Text`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #888;
`;

const LoginLink = styled.Text`
  color: rgb(225, 35, 35);
  font-weight: bold;
`;
