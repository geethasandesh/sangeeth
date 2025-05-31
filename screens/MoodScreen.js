import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { getSongsByMood } from '../utils/firebaseHelpers';

const MOODS = [
  {
    id: 'happy',
    title: 'Happy',
    icon: 'smile-beam',
    color: '#FFD700',
    description: 'Upbeat and cheerful tunes',
  },
  {
    id: 'sad',
    title: 'Sad',
    icon: 'sad-tear',
    color: '#4169E1',
    description: 'Melancholic and emotional songs',
  },
  {
    id: 'energetic',
    title: 'Energetic',
    icon: 'bolt',
    color: '#FF4500',
    description: 'High-energy tracks to boost your mood',
  },
  {
    id: 'relaxed',
    title: 'Relaxed',
    icon: 'spa',
    color: '#98FB98',
    description: 'Calm and peaceful melodies',
  },
  {
    id: 'romantic',
    title: 'Romantic',
    icon: 'heart',
    color: '#FF69B4',
    description: 'Love songs and romantic ballads',
  },
  {
    id: 'focused',
    title: 'Focused',
    icon: 'bullseye',
    color: '#9370DB',
    description: 'Music to help you concentrate',
  },
];

const SearchScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [moodSongs, setMoodSongs] = useState([]);
  const { playSong, setQueue } = useMusicPlayer();

  const handleMoodSelect = async (mood) => {
    console.log('Selected mood:', mood);
    setSelectedMood(mood);
    setLoading(true);
    try {
      const songs = await getSongsByMood(mood.id);
      console.log('Received songs from getSongsByMood:', songs);
      setMoodSongs(songs);
    } catch (error) {
      console.error('Error fetching songs by mood:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMoodCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.moodCard, { backgroundColor: item.color + '20' }]}
      onPress={() => handleMoodSelect(item)}
    >
      <FontAwesome5 name={item.icon} size={32} color={item.color} />
      <Text style={styles.moodTitle}>{item.title}</Text>
      <Text style={styles.moodDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => {
        setQueue(moodSongs);
        playSong(item, moodSongs.findIndex(song => song.id === item.id));
      }}
    >
      {item.albumArtUrl ? (
        <Image source={{ uri: item.albumArtUrl }} style={styles.albumArt} />
      ) : (
        <View style={styles.albumArtPlaceholder}>
          <MaterialIcons name="music-note" size={24} color="#fff" />
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
      <Ionicons name="play-circle-outline" size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mood</Text>

      {!selectedMood ? (
        <FlatList
          data={MOODS}
          renderItem={renderMoodCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.moodGrid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.moodView}>
          <View style={styles.moodHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedMood(null);
                setMoodSongs([]);
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.moodHeaderContent}>
              <FontAwesome5 name={selectedMood.icon} size={24} color={selectedMood.color} />
              <Text style={styles.moodHeaderTitle}>{selectedMood.title}</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
            </View>
          ) : (
            <FlatList
              data={moodSongs}
              renderItem={renderSongItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.songList}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <MaterialIcons name="music-note" size={48} color="#666" />
                  <Text style={styles.emptyStateText}>
                    No songs found for this mood
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  moodGrid: {
    padding: 10,
  },
  moodCard: {
    flex: 1,
    margin: 10,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  moodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  moodDescription: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  moodView: {
    flex: 1,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  moodHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songList: {
    padding: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  albumArtPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
});

export default SearchScreen;
