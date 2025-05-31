import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PlayLists = () => {
  const navigation = useNavigation();
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, 'recentlyPlayed'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );

        const snapshot = await getDocs(q);
        const songs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentSongs(songs);
      } catch (error) {
        console.error('Error fetching recently played songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyPlayed();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.songItem}>
      <Text style={styles.songTitle}>{item.songTitle || 'Untitled Song'}</Text>
      <Text style={styles.songArtist}>{item.artist || 'Unknown Artist'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recently Played</Text>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : recentSongs.length === 0 ? (
        <View style={styles.messageContainer}>
          <Ionicons name="musical-notes-outline" size={50} color="#888" />
          <Text style={styles.messageText}>You haven't played anything yet.</Text>
        </View>
      ) : (
        <FlatList
          data={recentSongs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default PlayLists;

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
  songItem: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songArtist: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
});
