import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LibraryScreen from '../screens/LibraryScreen';
import LikedSongs from '../components/LikedSongs';
import PlayLists from '../components/PlayLists';
import PodCasts from '../components/PodCasts';
import RecentlyPlayed from '../components/RecentlyPlayed';

const LibraryStack = createNativeStackNavigator();

export default function LibraryStackScreen() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="LibraryMain" component={LibraryScreen} />
      <LibraryStack.Screen name="LikedSongs" component={LikedSongs} />
      <LibraryStack.Screen name="PlayLists" component={PlayLists} />
      <LibraryStack.Screen name="PodCasts" component={PodCasts} />
      <LibraryStack.Screen name="RecentlyPlayed" component={RecentlyPlayed} />
    </LibraryStack.Navigator>
  );
}
