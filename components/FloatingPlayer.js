import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FloatingPlayer() {
  const { user } = useAuth();
  const {
    currentSong,
    isPlaying,
    pauseSong,
    resumeSong,
    playNext,
    playPrevious,
    toggleLike,
    isLiked,
    repeatMode,
    toggleRepeat,
    isShuffle,
    toggleShuffle,
    position,
    duration,
    seekTo,
    isLoading,
    error,
    queue,
    currentIndex,
  } = useMusicPlayer();

  const [expanded, setExpanded] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Playback Error', error);
    }
  }, [error]);

  useEffect(() => {
    if (!isSliding) {
      setSliderValue(Math.min(position, duration));
    }
  }, [position, isSliding, duration]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { actionIdentifier } = response;
      
      switch (actionIdentifier) {
        case 'play_pause':
          if (isPlaying) {
            pauseSong();
          } else {
            resumeSong();
          }
          break;
        case 'next':
          playNext();
          break;
        case 'previous':
          playPrevious();
          break;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isPlaying]);

  if (!user || !currentSong) return null;

  const formattedTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      await pauseSong();
    } else {
      await resumeSong();
    }
  };

  const handleSeek = (value) => {
    setSliderValue(value);
    setIsSliding(true);
  };

  const handleSeekComplete = async (value) => {
    setIsSliding(false);
    await seekTo(value);
  };

  const isPrevDisabled = currentIndex <= 0 && repeatMode === 'off' && !isShuffle;
  const isNextDisabled = currentIndex >= queue.length - 1 && repeatMode === 'off' && !isShuffle;

  return (
    <View style={StyleSheet.absoluteFill}>
      {expanded ? (
        <View style={styles.expandedContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setExpanded(false);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="chevron-down" size={32} color="#fff" />
          </TouchableOpacity>

          <View style={styles.albumArtContainer}>
            {currentSong.artwork ? (
              <Image
                source={{ uri: currentSong.artwork }}
                style={styles.albumArt}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.albumArt, styles.albumArtPlaceholder]}>
                <Ionicons name="musical-notes" size={64} color="#555" />
              </View>
            )}
          </View>

          <Text style={styles.songTitle} numberOfLines={2}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist}>{currentSong.artist}</Text>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={sliderValue}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#b3b3b3"
            thumbTintColor="#fff"
            onValueChange={handleSeek}
            onSlidingComplete={handleSeekComplete}
            disabled={duration === 0}
          />

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formattedTime(sliderValue)}</Text>
            <Text style={styles.timeText}>{formattedTime(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={() => {
              toggleShuffle();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}>
              <MaterialIcons name="shuffle" size={28} color={isShuffle ? '#1DB954' : '#fff'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!isPrevDisabled) {
                  playPrevious();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              disabled={isPrevDisabled}
            >
              <Ionicons
                name="play-skip-back"
                size={36}
                color={isPrevDisabled ? '#666' : '#fff'}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePlayPause}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#1DB954" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={64}
                  color="#1DB954"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!isNextDisabled) {
                  playNext();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              disabled={isNextDisabled}
            >
              <Ionicons
                name="play-skip-forward"
                size={36}
                color={isNextDisabled ? '#666' : '#fff'}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              toggleRepeat();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}>
              <MaterialIcons
                name={repeatMode === 'one' ? 'repeat-one' : 'repeat'}
                size={28}
                color={repeatMode === 'off' ? '#fff' : '#1DB954'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.additionalControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                toggleLike();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <FontAwesome
                name={isLiked ? 'heart' : 'heart-o'}
                size={24}
                color={isLiked ? '#1DB954' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.queueInfo}>
            <Text style={styles.queueText}>
              {currentIndex + 1} of {queue.length} songs
            </Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.miniContainer}
          onPress={() => {
            setExpanded(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.miniTitle} numberOfLines={1}>
            {currentSong.title}
          </Text>

          <View style={styles.miniControls}>
            <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#1DB954" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={36}
                  color="#1DB954"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!isNextDisabled) {
                  playNext();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.controlButton}
              disabled={isNextDisabled}
            >
              <Ionicons
                name="play-skip-forward"
                size={36}
                color={isNextDisabled ? '#666' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  miniContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#222',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 10,
    justifyContent: 'space-between',
  },
  miniTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
  },
  expandedContainer: {
    position: 'absolute',
    bottom: 0,
    height: SCREEN_HEIGHT * 0.85,
    width: '100%',
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
  },
  albumArtContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  albumArt: {
    width: 280,
    height: 280,
    borderRadius: 12,
  },
  albumArtPlaceholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songTitle: {
    marginTop: 20,
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artist: {
    color: '#bbb',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  slider: {
    marginTop: 30,
    width: '100%',
    height: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
  },
  controls: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  additionalControls: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  queueInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  queueText: {
    color: '#666',
    fontSize: 14,
  },
});
