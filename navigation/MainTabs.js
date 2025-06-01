import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminStack from './AdminStack';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { isAdmin, userData } = useAuth();

  useEffect(() => {
    console.log('MainTabs - Component mounted');
    console.log('MainTabs - User Data:', userData);
    console.log('MainTabs - Is Admin:', isAdmin);
    console.log('MainTabs - User Role:', userData?.role);
  }, [isAdmin, userData]);

  const shouldShowAdminTab = isAdmin && userData?.role === 'admin';
  console.log('MainTabs - Should show admin tab:', shouldShowAdminTab);

  const screens = [
    {
      name: 'Home',
      component: HomeScreen,
      options: {
        title: 'Home',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
        ),
      },
    },
    {
      name: 'Profile',
      component: ProfileScreen,
      options: {
        title: 'Profile',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
        ),
      },
    },
  ];

  if (shouldShowAdminTab) {
    screens.push({
      name: 'Admin',
      component: AdminStack,
      options: {
        headerShown: false,
        title: 'Admin',
        tabBarLabel: 'Admin',
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
        ),
      },
    });
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#e53935',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#2c2c2e',
        },
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#fff',
      }}
    >
      {screens.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Tab.Navigator>
  );
} 