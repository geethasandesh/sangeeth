import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import AppNavigator from './navigation/AppNavigator';
import FloatingPlayer from './components/FloatingPlayer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
      <SafeAreaProvider>
        <AuthProvider>
          <MusicPlayerProvider>
            <AppNavigator />
          <FloatingPlayer />
        </MusicPlayerProvider>
      </AuthProvider>
      </SafeAreaProvider>
   
  );
}
