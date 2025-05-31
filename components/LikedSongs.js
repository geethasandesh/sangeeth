import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, orderBy, onSnapshot, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';

const LikedSongs = () => {
  const navigation = useNavigation();
  const [likedSongs, setLikedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong, setQueue, currentSong, isLiked, toggleLike } = useMusicPlayer();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const likedSongsRef = collection(db, 'likedSongs');
    const q = query(
      likedSongsRef, 
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const songs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLikedSongs(songs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching liked songs:', error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user]);

  const handlePlaySong = async (song) => {
    const index = likedSongs.findIndex(s => s.songId === song.songId);
    if (index !== -1) {
      setQueue(likedSongs);
      await playSong(song, index);
    }
  };

  const handleUnlike = async (song) => {
    try {
      const likedSongsRef = collection(db, 'likedSongs');
      const q = query(likedSongsRef, where('songId', '==', song.songId));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error('Error unliking song:', error);
    }
  };

  const renderItem = ({ item }) => {
    const isCurrentlyPlaying = currentSong?.id === item.songId;
    
    return (
      <TouchableOpacity
        style={[
          styles.songItem,
          isCurrentlyPlaying && styles.currentSongItem
        ]}
        onPress={() => handlePlaySong(item)}
      >
        {item.albumArtUrl ? (
          <Image source={{ uri: item.albumArtUrl }} style={styles.albumArt} />
        ) : (
          <View style={styles.albumPlaceholder}>
            <Ionicons name="musical-notes" size={24} color="#fff" />
          </View>
        )}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{item.artist || 'Unknown Artist'}</Text>
        </View>
        <Ionicons 
          name={isCurrentlyPlaying ? 'pause-circle' : 'play-circle-outline'} 
          size={24} 
          color={isCurrentlyPlaying ? '#1DB954' : '#fff'} 
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Liked Songs</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liked Songs</Text>
      </View>

      {likedSongs.length === 0 ? (
        <View style={styles.messageContainer}>
          <Ionicons name="musical-notes-outline" size={50} color="#888" />
          <Text style={styles.messageText}>You haven't liked anything yet.</Text>
        </View>
      ) : (
        <FlatList
          data={likedSongs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default LikedSongs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  albumPlaceholder: {
    width: 50,
    height: 50,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  songArtist: {
    fontSize: 14,
    color: '#b3b3b3',
    marginTop: 3,
  },
  currentSongItem: {
    backgroundColor: '#383838',
    borderLeftWidth: 3,
    borderLeftColor: '#1DB954',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  likeButton: {
    padding: 5,
  },
});
