import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getDownloadedSongs } from '../utils/downloadManager';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [hasDownloads, setHasDownloads] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    // Check network status
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = isOffline;
      const isNowOffline = !state.isConnected;
      
      setIsOffline(isNowOffline);
      
      if (isNowOffline) {
        checkDownloads();
      } else if (wasOffline) {
        // If we were offline and now we're online
        setIsReconnecting(true);
        // Show reconnection message for 2 seconds
        setTimeout(() => {
          setIsReconnecting(false);
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [isOffline]);

  useEffect(() => {
    if (isOffline || isReconnecting) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, isReconnecting]);

  const checkDownloads = async () => {
    if (!user) return;
    try {
      const songs = await getDownloadedSongs(user.uid);
      setHasDownloads(songs.length > 0);
    } catch (error) {
      console.error('Error checking downloads:', error);
      setHasDownloads(false);
    }
  };

  const handleGoToDownloads = () => {
    navigation.navigate('Library', { screen: 'Downloads' });
  };

  if (!isOffline && !isReconnecting) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: isReconnecting ? '#34C759' : '#FF3B30'
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={isReconnecting ? "cloud-done" : "cloud-offline"} 
          size={24} 
          color="#fff" 
        />
        <Text style={styles.text}>
          {isReconnecting ? 'Back online' : 'You are offline'}
        </Text>
        {!isReconnecting && hasDownloads && (
          <TouchableOpacity 
            style={styles.button}
            onPress={handleGoToDownloads}
          >
            <Text style={styles.buttonText}>Go to Downloads</Text>
          </TouchableOpacity>
        )}
        {!isReconnecting && !hasDownloads && (
          <Text style={styles.subText}>Download songs to listen offline</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 50, // Account for status bar
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  subText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  buttonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OfflineBanner; 