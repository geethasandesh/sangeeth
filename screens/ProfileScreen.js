import React, { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator, Linking } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (user) {
      setUserInfo({
        email: user.email,
        username: user.email.split('@')[0],
        joined: 'May 2025',
        totalPlays: 0,
        favoriteGenre: 'None',
        followers: 0,
      });
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await logout();
          } catch (e) {
            Alert.alert('Logout Failed', e.message || 'Something went wrong');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (!userInfo) {
    return (
      <Centered>
        <ActivityIndicator size="large" color="#e53935" />
      </Centered>
    );
  }

  return (
    <Container>
      <Header>
        <Ionicons name="person-circle-outline" size={80} color="#fff" />
        <Username>{userInfo.username}</Username>
        <Email>{userInfo.email}</Email>
        <Joined>Member since {userInfo.joined}</Joined>
      </Header>

      <Section>
        <SectionTitle>Stats</SectionTitle>
        <StatRow>
          <StatItem>
            <StatValue>{userInfo.totalPlays}</StatValue>
            <StatLabel>Plays</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{userInfo.followers}</StatValue>
            <StatLabel>Followers</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{userInfo.favoriteGenre}</StatValue>
            <StatLabel>Top Genre</StatLabel>
          </StatItem>
        </StatRow>
      </Section>

      <Section>
        <SectionTitle>Social</SectionTitle>
        <Option onPress={() => Linking.openURL('https://instagram.com/sanddeshhh')}>
          <FontAwesome5 name="instagram" size={20} color="#e1306c" />
          <OptionText>Connect Instagram</OptionText>
        </Option>
        <Option onPress={() => Linking.openURL('https://twitter.com/geethasandesh')}>
          <FontAwesome5 name="twitter" size={20} color="#1da1f2" />
          <OptionText>Connect Twitter</OptionText>
        </Option>
      </Section>

      <LogoutButton onPress={handleLogout} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <LogoutText>Log Out</LogoutText>}
      </LogoutButton>

      <Section>
        <SectionTitle>About</SectionTitle>
        <AboutText>
          Sangeeth is your personal music companion. Explore, vibe, and connect through music anytime, anywhere.
        </AboutText>
      </Section>
    </Container>
  );
}

// Styled Components
const Container = styled.ScrollView`
  flex: 1;
  background-color: #121212;
  padding: 20px;
`;

const Centered = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #121212;
`;

const Header = styled.View`
  align-items: center;
  padding: 40px 0;
  margin-bottom: 20px;
`;

const Username = styled.Text`
  font-size: 24px;
  color: #fff;
  font-weight: bold;
  margin-top: 10px;
`;

const Email = styled.Text`
  font-size: 14px;
  color: #bbb;
  margin-top: 5px;
`;

const Joined = styled.Text`
  font-size: 12px;
  color: #888;
  margin-top: 5px;
`;

const Section = styled.View`
  background-color: #1c1c1e;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: rgb(255, 255, 255);
  margin-bottom: 15px;
`;

const StatRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const StatItem = styled.View`
  align-items: center;
  flex: 1;
`;

const StatValue = styled.Text`
  font-size: 18px;
  color: #fff;
  font-weight: bold;
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: #bbb;
  margin-top: 5px;
`;

const Option = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px 0;
`;

const OptionText = styled.Text`
  font-size: 16px;
  color: #fff;
  margin-left: 12px;
`;

const AboutText = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: #bbb;
`;

const LogoutButton = styled.TouchableOpacity`
  background-color: rgb(255, 255, 255);
  padding: 15px;
  border-radius: 10px;
  align-items: center;
  margin-bottom: 20px;
`;

const LogoutText = styled.Text`
  color: black;
  font-size: 16px;
  font-weight: bold;
`;
