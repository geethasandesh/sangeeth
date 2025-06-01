import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminScreen() {
  const { isAdmin, userData } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    console.log('AdminScreen - Component mounted');
    console.log('AdminScreen - User Data:', userData);
    console.log('AdminScreen - Is Admin:', isAdmin);
    console.log('AdminScreen - User Role:', userData?.role);

    const isUserAdmin = isAdmin && userData?.role === 'admin';
    console.log('AdminScreen - Is User Admin:', isUserAdmin);

    if (!isUserAdmin) {
      console.log('AdminScreen - Access Denied, redirecting...');
      Alert.alert('Access Denied', 'You do not have permission to access this page.');
      navigation.navigate('Home');
    }
  }, [isAdmin, userData, navigation]);

  const isUserAdmin = isAdmin && userData?.role === 'admin';

  // If not admin, don't render anything
  if (!isUserAdmin) {
    console.log('AdminScreen - Not rendering due to lack of admin access');
    return null;
  }

  console.log('AdminScreen - Rendering admin dashboard');
  return (
    <Container>
      <Header>
        <Title>Admin Dashboard</Title>
        <Subtitle>Welcome to the admin panel</Subtitle>
        <Subtitle>Role: {userData?.role}</Subtitle>
      </Header>

      <Section>
        <SectionTitle>Quick Stats</SectionTitle>
        <StatRow>
          <StatItem>
            <StatValue>0</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>0</StatValue>
            <StatLabel>Total Songs</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>0</StatValue>
            <StatLabel>Total Plays</StatLabel>
          </StatItem>
        </StatRow>
      </Section>

      <Section>
        <SectionTitle>Admin Actions</SectionTitle>
        <ActionButton>
          <ActionButtonText>Manage Users</ActionButtonText>
        </ActionButton>
        <ActionButton>
          <ActionButtonText>Manage Songs</ActionButtonText>
        </ActionButton>
        <ActionButton>
          <ActionButtonText>View Analytics</ActionButtonText>
        </ActionButton>
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

const Header = styled.View`
  padding: 20px 0;
  margin-bottom: 20px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: #fff;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: #bbb;
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
  color: #fff;
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
  font-size: 24px;
  color: #fff;
  font-weight: bold;
`;

const StatLabel = styled.Text`
  font-size: 12px;
  color: #bbb;
  margin-top: 5px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: #2c2c2e;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const ActionButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  text-align: center;
`; 