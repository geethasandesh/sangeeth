import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { Platform } from 'react-native';
import { 
  validateSong, 
  validatePlaylist, 
  validateUser, 
  validateAnalytics,
  formatValidationErrors 
} from './schemaValidator';

// Song Management Functions
export const addSong = async (songData) => {
  try {
    // Validate song data
    const validation = validateSong(songData);
    if (!validation.isValid) {
      throw new Error(`Invalid song data: ${formatValidationErrors(validation.errors)}`);
    }

    const songsRef = collection(db, 'songs');
    const newSongRef = doc(songsRef);
    await setDoc(newSongRef, {
      ...songData,
      mood: songData.mood || [], // Initialize mood as empty array if not provided
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      playCount: 0,
      likeCount: 0
    });
    return newSongRef.id;
  } catch (error) {
    console.error('Error adding song:', error);
    throw error;
  }
};

export const getSong = async (songId) => {
  try {
    const songRef = doc(db, 'songs', songId);
    const songSnap = await getDoc(songRef);
    return songSnap.exists() ? { id: songSnap.id, ...songSnap.data() } : null;
  } catch (error) {
    console.error('Error getting song:', error);
    throw error;
  }
};

export const getSongsByGenre = async (genre) => {
  try {
    const songsRef = collection(db, 'songs');
    const q = query(songsRef, where('genre', 'array-contains', genre));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting songs by genre:', error);
    throw error;
  }
};

export const getSongsByMood = async (mood) => {
  try {
    console.log('Fetching songs for mood:', mood);
    const songsRef = collection(db, 'songs');
    // Query for both string and array mood fields
    const q = query(songsRef, where('mood', '==', mood));
    const querySnapshot = await getDocs(q);
    const songs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('Found songs:', songs);
    return songs;
  } catch (error) {
    console.error('Error getting songs by mood:', error);
    throw error;
  }
};

export const incrementPlayCount = async (songId) => {
  try {
    const songRef = doc(db, 'songs', songId);
    await updateDoc(songRef, {
      playCount: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing play count:', error);
    throw error;
  }
};

// Playlist Management Functions
export const createPlaylist = async (userId, playlistData) => {
  try {
    // Validate playlist data
    const validation = validatePlaylist(playlistData);
    if (!validation.isValid) {
      throw new Error(`Invalid playlist data: ${formatValidationErrors(validation.errors)}`);
    }

    const playlistsRef = collection(db, 'playlists');
    const newPlaylistRef = doc(playlistsRef);
    await setDoc(newPlaylistRef, {
      ...playlistData,
      createdBy: userId,
      songs: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return newPlaylistRef.id;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    await updateDoc(playlistRef, {
      songs: arrayUnion(songId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    throw error;
  }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const playlistRef = doc(db, 'playlists', playlistId);
    await updateDoc(playlistRef, {
      songs: arrayRemove(songId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    throw error;
  }
};

// User Data Management Functions
export const createUserProfile = async (userId, userData) => {
  try {
    // Validate user data
    const validation = validateUser(userData);
    if (!validation.isValid) {
      throw new Error(`Invalid user data: ${formatValidationErrors(validation.errors)}`);
    }

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      likedSongs: [],
      playlists: [],
      recentlyPlayed: [],
      settings: {
        audioQuality: 'high',
        downloadQuality: 'high',
        theme: 'dark',
        notifications: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const toggleLikeSong = async (userId, songId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    if (userData.likedSongs.includes(songId)) {
      await updateDoc(userRef, {
        likedSongs: arrayRemove(songId)
      });
      return false; // Song unliked
    } else {
      await updateDoc(userRef, {
        likedSongs: arrayUnion(songId)
      });
      return true; // Song liked
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const addToRecentlyPlayed = async (userId, songId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    // Keep only last 50 recently played songs
    const recentlyPlayed = userData.recentlyPlayed || [];
    const newEntry = { songId, timestamp: serverTimestamp() };
    
    const updatedRecentlyPlayed = [newEntry, ...recentlyPlayed.slice(0, 49)];
    
    await updateDoc(userRef, {
      recentlyPlayed: updatedRecentlyPlayed
    });
  } catch (error) {
    console.error('Error adding to recently played:', error);
    throw error;
  }
};

// Analytics Functions
export const logPlaybackEvent = async (userId, songId, action) => {
  try {
    const analyticsData = {
      userId,
      songId,
      action,
      timestamp: serverTimestamp(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version
      }
    };

    // Validate analytics data
    const validation = validateAnalytics(analyticsData);
    if (!validation.isValid) {
      throw new Error(`Invalid analytics data: ${formatValidationErrors(validation.errors)}`);
    }

    const analyticsRef = collection(db, 'analytics');
    await setDoc(doc(analyticsRef), analyticsData);
  } catch (error) {
    console.error('Error logging playback event:', error);
    throw error;
  }
};

export const getAllSongs = async () => {
  try {
    const songsRef = collection(db, 'songs');
    const querySnapshot = await getDocs(songsRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all songs:', error);
    throw error;
  }
};

export const updateSongMood = async (songId, mood) => {
  try {
    const songRef = doc(db, 'songs', songId);
    // Simply set the mood as a string
    await updateDoc(songRef, {
      mood: mood,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating song mood:', error);
    throw error;
  }
}; 