import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

const BACKGROUND_AUDIO_TASK = 'BACKGROUND_AUDIO_TASK';
const MusicPlayerContext = createContext();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Background task definition
TaskManager.defineTask(BACKGROUND_AUDIO_TASK, async () => {
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export function MusicPlayerProvider({ children }) {
  const { user } = useAuth();
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundObj, setSoundObj] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [volume, setVolume] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'one', 'all'
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const originalQueue = useRef([]);

  // Add cleanup function
  const cleanupPlayer = async () => {
    if (soundObj) {
      await soundObj.unloadAsync();
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setQueue([]);
    setCurrentIndex(-1);
    setPosition(0);
    setDuration(0);
    setError(null);
    setIsLiked(false);
  };

  // Add effect to cleanup when user logs out
  useEffect(() => {
    if (!user) {
      cleanupPlayer();
    }
  }, [user]);

  useEffect(() => {
    loadSavedState();
    configureAudio();
    setupNotifications();
    return () => {
      cleanupAudio();
    };
  }, []);

  const configureAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1, // Audio.InterruptionModeIOS.DoNotMix
        interruptionModeAndroid: 1, // Audio.InterruptionModeAndroid.DoNotMix
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error configuring audio:', error);
    }
  };

  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const cleanupAudio = async () => {
    if (soundObj) {
      await soundObj.unloadAsync();
    }
  };

  const updateNotification = async (song) => {
    if (!song) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: song.title,
          body: song.artist || 'Unknown Artist',
          data: { songId: song.id },
          sticky: true,
          autoDismiss: false,
          // Add media controls to notification
          android: {
            channelId: 'music-player',
            priority: 'high',
            sticky: true,
            actions: [
              {
                title: 'Previous',
                icon: 'previous',
                identifier: 'previous',
              },
              {
                title: isPlaying ? 'Pause' : 'Play',
                icon: isPlaying ? 'pause' : 'play',
                identifier: 'play_pause',
              },
              {
                title: 'Next',
                icon: 'next',
                identifier: 'next',
              },
            ],
          },
          ios: {
            // iOS media controls
            categoryIdentifier: 'music-controls',
            threadIdentifier: 'music-player',
            interruptionLevel: 'active',
            relevanceScore: 1,
          },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const loadSavedState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('musicPlayerState');
      if (savedState) {
        const { queue, currentIndex, volume, playbackSpeed, repeatMode, isShuffle } = JSON.parse(savedState);
        setQueue(queue);
        setCurrentIndex(currentIndex);
        setVolume(volume);
        setPlaybackSpeed(playbackSpeed);
        setRepeatMode(repeatMode);
        setIsShuffle(isShuffle);
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  };

  const saveState = async () => {
    try {
      const state = {
        queue,
        currentIndex,
        volume,
        playbackSpeed,
        repeatMode,
        isShuffle,
      };
      await AsyncStorage.setItem('musicPlayerState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  const cacheAudio = async (song) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
        true
      );
      return sound;
    } catch (error) {
      console.error('Error caching audio:', error);
      return null;
    }
  };

  const playSong = async (song, index) => {
    try {
      if (!song || !song.url) throw new Error('Invalid song data');

      setIsLoading(true);
      setError(null);

      if (soundObj) {
        await soundObj.unloadAsync();
      }

      const sound = await cacheAudio(song);
      if (!sound) throw new Error('Failed to load audio');

      // Check if the song is liked by current user
      const likedSongsRef = collection(db, 'likedSongs');
      const q = query(
        likedSongsRef, 
        where('songId', '==', song.songId || song.id),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const isSongLiked = !querySnapshot.empty;
      setIsLiked(isSongLiked);

      setSoundObj(sound);
      setCurrentSong(song);
      setCurrentIndex(index);
      setIsPlaying(true);

      await sound.setVolumeAsync(volume);
      await sound.setRateAsync(playbackSpeed, true);
      await sound.playAsync();

      // Update notification when playing new song
      await updateNotification(song);

      saveState();
    } catch (error) {
      setError(error.message);
      console.error('playSong error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);

      if (status.didJustFinish) {
        handlePlaybackFinish();
      }
    }
  };

  const handlePlaybackFinish = async () => {
    if (repeatMode === 'one') {
      await soundObj?.replayAsync();
    } else {
      await playNext();
    }
  };

  const pauseSong = async () => {
    if (soundObj) {
      await soundObj.pauseAsync();
      setIsPlaying(false);
      // Remove notification when paused
      await Notifications.dismissAllNotificationsAsync();
    }
  };

  const resumeSong = async () => {
    if (soundObj) {
      await soundObj.playAsync();
      setIsPlaying(true);
      // Show notification when resumed
      if (currentSong) {
        await updateNotification(currentSong);
      }
    }
  };

  const playNext = async () => {
    try {
      if (queue.length === 0) return;

      if (repeatMode === 'one') {
        await soundObj?.replayAsync();
        return;
      }

      let nextIndex = isShuffle
        ? Math.floor(Math.random() * queue.length)
        : currentIndex + 1;

      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          setCurrentSong(null);
          return;
        }
      }

      const nextSong = queue[nextIndex];
      if (nextSong) {
        await playSong(nextSong, nextIndex);
      }
    } catch (error) {
      console.error('playNext error:', error);
      setError('Could not play next track.');
    }
  };

  const playPrevious = async () => {
    try {
      if (queue.length === 0) return;

      if (repeatMode === 'one') {
        await soundObj?.replayAsync();
        return;
      }

      let prevIndex = isShuffle
        ? Math.floor(Math.random() * queue.length)
        : currentIndex - 1;

      if (prevIndex < 0) {
        if (repeatMode === 'all') {
          prevIndex = queue.length - 1;
        } else {
          return;
        }
      }

      const prevSong = queue[prevIndex];
      if (prevSong) {
        await playSong(prevSong, prevIndex);
      }
    } catch (error) {
      console.error('playPrevious error:', error);
      setError('Could not play previous track.');
    }
  };

  const seekTo = async (positionMillis) => {
    if (soundObj) {
      await soundObj.setPositionAsync(positionMillis);
    }
  };

  const changeVolume = async (value) => {
    if (soundObj) {
      await soundObj.setVolumeAsync(value);
      setVolume(value);
      saveState();
    }
  };

  const changePlaybackSpeed = async (speed) => {
    if (soundObj) {
      await soundObj.setRateAsync(speed, true);
      setPlaybackSpeed(speed);
      saveState();
    }
  };

  const toggleRepeat = () => {
    const modes = ['off', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
    saveState();
  };

  const toggleShuffle = () => {
    if (!isShuffle) {
      originalQueue.current = [...queue];
      const shuffledQueue = [...queue].sort(() => Math.random() - 0.5);
      setQueue(shuffledQueue);
    } else {
      setQueue(originalQueue.current);
    }
    setIsShuffle(!isShuffle);
    saveState();
  };

  const toggleLike = async () => {
    try {
      if (!currentSong || !user) return;
      
      const likedSongsRef = collection(db, 'likedSongs');
      const q = query(
        likedSongsRef, 
        where('songId', '==', currentSong.songId || currentSong.id),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      
      if (isLiked) {
        // Unlike - remove from Firebase
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        setIsLiked(false);
      } else {
        // Like - add to Firebase
        const songData = {
          songId: currentSong.songId || currentSong.id,
          title: currentSong.title || 'Unknown Title',
          artist: currentSong.artist || 'Unknown Artist',
          url: currentSong.url,
          userId: user.uid,
          timestamp: new Date().toISOString()
        };

        // Only add albumArtUrl if it exists
        if (currentSong.albumArtUrl) {
          songData.albumArtUrl = currentSong.albumArtUrl;
        }
        
        await addDoc(likedSongsRef, songData);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
    saveState();
  };

  const removeFromQueue = (index) => {
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    saveState();
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentIndex(-1);
    setCurrentSong(null);
    if (soundObj) {
      soundObj.unloadAsync();
    }
    saveState();
  };

  // Add a new function to check if a song is liked
  const checkIfSongIsLiked = async (songId) => {
    try {
      const likedSongsRef = collection(db, 'likedSongs');
      const q = query(likedSongsRef, where('songId', '==', songId));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if song is liked:', error);
      return false;
    }
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        volume,
        playbackSpeed,
        repeatMode,
        isShuffle,
        isLiked,
        position,
        duration,
        isLoading,
        error,
        playSong,
        pauseSong,
        resumeSong,
        playNext,
        playPrevious,
        seekTo,
        changeVolume,
        changePlaybackSpeed,
        toggleRepeat,
        toggleShuffle,
        toggleLike,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setQueue,
        checkIfSongIsLiked,
        cleanupPlayer,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  return useContext(MusicPlayerContext);
}
