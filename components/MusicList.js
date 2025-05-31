import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const MusicList = ({ navigation }) => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { currentSong, isPlaying, playSong, pauseSong, setQueue } = useMusicPlayer();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'songs'));
        const fetchedSongs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSongs(fetchedSongs);
        setFilteredSongs(fetchedSongs);
      } catch (e) {
        console.error('Error fetching songs:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = songs.filter(song =>
      song.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSongs(filtered);
  };

  const handlePlayPause = async (song) => {
    if (currentSong?.id === song.id && isPlaying) {
      pauseSong();
    } else {
      const index = filteredSongs.findIndex(s => s.id === song.id);
      if (index !== -1) {
        setQueue(filteredSongs); // ✅ Set the queue before playing
        await playSong(song, index); // ✅ Pass the index
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.songCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        onPress={async () => {
          const index = filteredSongs.findIndex(s => s.id === item.id);
          if (index !== -1) {
            setQueue(filteredSongs); // ✅ Set queue on tap
            await playSong(item, index); // ✅ Use correct index
          }
        }}
      >
        {item.albumArtUrl ? (
          <Image source={{ uri: item.albumArtUrl }} style={styles.albumArt} />
        ) : (
          <View style={styles.albumPlaceholder}>
            <Ionicons name="musical-notes" size={28} color="#fff" />
          </View>
        )}

        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {item.artist || 'Unknown Artist'}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePlayPause(item)}>
        <Ionicons
          name={currentSong?.id === item.id && isPlaying ? 'pause-circle' : 'play-circle'}
          size={32}
          color="#fff"
          style={{ marginLeft: 12 }}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', paddingHorizontal: 10, paddingTop: 20 }}>
      <TextInput
        placeholder="Search songs"
        placeholderTextColor="#999"
        value={search}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MusicList;

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    flex: 1,
  },
  searchBar: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    height: 60,
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  albumPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  songArtist: {
    fontSize: 12,
    color: '#b3b3b3',
    marginTop: 2,
  },
});
