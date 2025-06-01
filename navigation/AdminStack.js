import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from '../screens/AdminScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  const { isAdmin, userData } = useAuth();

  useEffect(() => {
    console.log('AdminStack - Component mounted');
    console.log('AdminStack - User Data:', userData);
    console.log('AdminStack - Is Admin:', isAdmin);
    console.log('AdminStack - User Role:', userData?.role);
  }, [isAdmin, userData]);

  const isUserAdmin = isAdmin && userData?.role === 'admin';
  console.log('AdminStack - Is User Admin:', isUserAdmin);

  if (!isUserAdmin) {
    console.log('AdminStack - Not rendering due to lack of admin access');
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminScreen}
        options={{
          title: 'Admin Dashboard',
          headerShown: true
        }}
      />
    </Stack.Navigator>
  );
} 