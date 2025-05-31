import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PlayLists = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Playlists</Text>
      </View>

      {/* Placeholder Message */}
      <View style={styles.messageContainer}>
        <Ionicons name="musical-notes-outline" size={50} color="#888" />
        <Text style={styles.messageText}>No playlists found.</Text>
      </View>
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
});
