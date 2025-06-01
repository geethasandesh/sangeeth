import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import AuthStack from './AuthStack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/MoodScreen';
import AdminStack from './AdminStack';
import FloatingPlayer from '../components/FloatingPlayer';
import OfflineBanner from '../components/OfflineBanner';

// Import Library stack navigator
import LibraryStackScreen from './LibraryStackScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom dark theme
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#333',
  },
};

function MainTabs() {
  const { isAdmin, userData } = useAuth();

  useEffect(() => {
    console.log('MainTabs - Component mounted');
    console.log('MainTabs - User Data:', userData);
    console.log('MainTabs - Is Admin:', isAdmin);
    console.log('MainTabs - User Role:', userData?.role);
  }, [isAdmin, userData]);

  const shouldShowAdminTab = isAdmin && userData?.role === 'admin';
  console.log('MainTabs - Should show admin tab:', shouldShowAdminTab);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Library') iconName = focused ? 'library' : 'library-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Mood') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Admin') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#aaa',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Library" component={LibraryStackScreen} />
      <Tab.Screen name="Mood" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      {shouldShowAdminTab && (
        <Tab.Screen 
          name="Admin" 
          component={AdminStack}
          options={{
            headerShown: false,
            title: 'Admin',
            tabBarLabel: 'Admin'
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading, isAdmin, userData } = useAuth();
  const { currentSong, isPlaying, playSong, pauseSong } = useMusicPlayer();

  useEffect(() => {
    console.log('AppNavigator - Component mounted');
    console.log('AppNavigator - User:', user?.email);
    console.log('AppNavigator - Is Admin:', isAdmin);
    console.log('AppNavigator - User Data:', userData);
    console.log('AppNavigator - User Role:', userData?.role);
  }, [user, isAdmin, userData]);

  if (loading) {
    console.log('AppNavigator - Loading state, showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  console.log('AppNavigator - Rendering navigation stack');
  return (
    <NavigationContainer theme={CustomDarkTheme}>
      <OfflineBanner />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>

      {/* Only show FloatingPlayer when user is logged in */}
      {user && <FloatingPlayer />}
    </NavigationContainer>
  );
}
