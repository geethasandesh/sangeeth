import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getDownloadedSongs, playDownloadedSong, removeDownloadedSong } from '../utils/downloadManager';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const Downloads = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { playSong, currentSong, isPlaying, pauseSong } = useMusicPlayer();
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadDownloadedSongs();
  }, []);

  const loadDownloadedSongs = async () => {
    if (!user) return;
    try {
      const songs = await getDownloadedSongs(user.uid);
      setDownloadedSongs(songs);
    } catch (error) {
      console.error('Error loading downloaded songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = async (song) => {
    try {
      if (!song.localUri) {
        throw new Error('Song not found in local storage');
      }

      // If the same song is clicked and it's playing, pause it
      if (currentSong && currentSong.id === song.id) {
        if (isPlaying) {
          await pauseSong();
        } else {
          // If it's paused, resume playing
          await playSong({
            ...song,
            url: song.localUri
          });
        }
        return;
      }

      // If a different song is clicked, stop current song and play new one
      if (currentSong && currentSong.id !== song.id) {
        await pauseSong(); // Stop current song
      }

      // Play the new song
      await playSong({
        ...song,
        url: song.localUri
      });
    } catch (error) {
      console.error('Error playing downloaded song:', error);
      Alert.alert('Error', 'Failed to play downloaded song. Please try downloading it again.');
    }
  };

  const handleRemoveDownload = async () => {
    if (!user || !selectedSong) return;
    setModalVisible(false);
    
    // If the song being removed is currently playing, stop it
    if (currentSong && currentSong.id === selectedSong.id) {
      await pauseSong();
    }
    
    const success = await removeDownloadedSong(user.uid, selectedSong.id);
    if (success) {
      setDownloadedSongs(downloadedSongs.filter(s => s.id !== selectedSong.id));
      setSelectedSong(null);
    } else {
      Alert.alert('Error', 'Failed to remove download.');
    }
  };

  const renderSongItem = ({ item }) => {
    const isCurrentSong = currentSong && currentSong.id === item.id;
    
    return (
      <View style={styles.songItem}>
        <TouchableOpacity 
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => handlePlaySong(item)}
        >
          {item.coverImage ? (
            <Image 
              source={{ uri: item.coverImage }} 
              style={styles.coverImage}
            />
          ) : (
            <View style={styles.coverImagePlaceholder}>
              <Ionicons name="musical-notes" size={24} color="#fff" />
            </View>
          )}
          <View style={styles.songInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {item.artist}
            </Text>
          </View>
          <Ionicons 
            name={isCurrentSong && isPlaying ? "pause" : "play"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            setSelectedSong(item);
            setModalVisible(true);
          }}
        >
          <Entypo name="dots-three-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Downloads</Text>
      </View>

      {loading ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Loading...</Text>
        </View>
      ) : downloadedSongs.length === 0 ? (
        <View style={styles.messageContainer}>
          <Ionicons name="download-outline" size={50} color="#888" />
          <Text style={styles.messageText}>No downloaded songs yet.</Text>
          <Text style={styles.messageText}>Download songs to listen offline.</Text>
        </View>
      ) : (
        <FlatList
          data={downloadedSongs}
          renderItem={renderSongItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal for 3-dots menu */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleRemoveDownload}
            >
              <Text style={styles.modalOptionText}>Remove from downloads</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Downloads;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  listContainer: {
    paddingHorizontal: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  coverImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: '100%',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  coverImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
