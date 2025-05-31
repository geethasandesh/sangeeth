import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MusicList from '../components/MusicList';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Sangeeth</Text>
        <Text style={styles.subtitle}>Your Free Music Player</Text>
      </View>

      <MusicList navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 25 : 50,
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#b3b3b3',
    marginTop: 4,
  },
});
