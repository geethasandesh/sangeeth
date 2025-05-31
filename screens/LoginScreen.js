import { View } from 'react-native';

import React, { useState } from 'react';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password); // ✅ now includes password
      // Auth state handles navigation
    } catch (e) {
      Alert.alert('Login Failed', e.message || 'Something went wrong');
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
        <Subtitle>Your music, anytime, anywhere</Subtitle>

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
            textContentType="password"
          />
        </InputWrapper>

        <LoginButton onPress={handleLoginPress} activeOpacity={0.8} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <LoginButtonText>Login</LoginButtonText>}
        </LoginButton>

        <SignupText>
          Don't have an account?{' '}
          <SignupLink onPress={() => navigation.navigate('Signup')}>Sign Up</SignupLink>
        </SignupText>
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
  color: rgb(4, 27, 12);
  text-align: center;
  margin-bottom: 20px;
`;

const Subtitle = styled.Text`
  font-size: 18px;
  color: #555;
  text-align: center;
  margin-bottom: 30px;
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

const LoginButton = styled.TouchableOpacity`
  background-color: rgb(4, 27, 12);
  padding: 14px;
  border-radius: 10px;
  margin-top: 10px;
  justify-content: center;
  align-items: center;
`;

const LoginButtonText = styled.Text`
  color: white;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
`;

const SignupText = styled.Text`
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #888;
`;

const SignupLink = styled.Text`
  color: rgb(207, 34, 34);
  font-weight: bold;
`;
