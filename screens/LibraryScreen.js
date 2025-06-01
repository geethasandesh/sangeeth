import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';

const CARD_DATA = [
  { title: 'Liked Songs', icon: <Ionicons name="heart" size={28} color="#1DB954" />, screen: 'LikedSongs' },
  { title: 'Downloads', icon: <MaterialIcons name="download" size={28} color="#ffa500" />, screen: 'Podcasts' },
  { title: 'Playlists', icon: <Entypo name="folder-music" size={28} color="#00bfff" />, screen: 'PlayLists' },
  { title: 'Recently Played', icon: <FontAwesome5 name="history" size={26} color="#ff69b4" />, screen: 'RecentlyPlayed' },
  { title: 'Create New', icon: <Ionicons name="add-circle-outline" size={28} color="#ccc" />, screen: null },
];

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 60) / 2; // two cards per row with 20px margins

const LibraryScreen = ({ navigation }) => {
  const handlePress = (screen) => {
    if (screen) {
      navigation.navigate(screen);
    } else {
      // Handle "Create New" or other cases if needed
      alert('Feature coming soon!');
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.header}>Your Library</Text>
      <FlatList
        data={CARD_DATA}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress(item.screen)}
            activeOpacity={0.7}
          >
            {item.icon}
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  grid: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: cardSize,
    height: cardSize,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  cardText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default LibraryScreen;
