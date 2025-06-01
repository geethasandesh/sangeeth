import * as FileSystem from 'expo-file-system';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { Audio } from 'expo-av';

const storage = getStorage();
const db = getFirestore();

export const downloadSong = async (song, userId, progressCallback) => {
  try {
    // Check for either url or audioUrl
    const songUrl = song.audioUrl || song.url;
    if (!song || !songUrl) {
      throw new Error('Invalid song data or missing audio URL');
    }

    // Create a local directory for the user if it doesn't exist
    const userDir = `${FileSystem.documentDirectory}${userId}/`;
    const dirInfo = await FileSystem.getInfoAsync(userDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(userDir, { intermediates: true });
    }

    // Download the song file
    const fileName = `${song.id}.mp3`;
    const localUri = `${userDir}${fileName}`;

    // Validate URL
    try {
      new URL(songUrl);
    } catch (e) {
      throw new Error('Invalid audio URL format');
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      songUrl,
      localUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        progressCallback(progress * 100);
      }
    );

    const { uri } = await downloadResumable.downloadAsync();

    // Save song metadata to Firestore
    const songRef = doc(db, 'users', userId, 'downloads', song.id);
    await setDoc(songRef, {
      ...song,
      localUri: uri,
      downloadedAt: new Date().toISOString(),
    });

    return uri;
  } catch (error) {
    console.error('Error downloading song:', error);
    throw error;
  }
};

export const checkIfDownloaded = async (songId, userId) => {
  try {
    if (!songId || !userId) {
      console.warn('Missing songId or userId when checking download status');
      return false;
    }

    const songRef = doc(db, 'users', userId, 'downloads', songId);
    const songDoc = await getDoc(songRef);
    return songDoc.exists();
  } catch (error) {
    console.error('Error checking download status:', error);
    return false;
  }
};

export const getDownloadedSongs = async (userId) => {
  try {
    if (!userId) {
      console.warn('Missing userId when getting downloaded songs');
      return [];
    }

    const downloadsRef = collection(db, 'users', userId, 'downloads');
    const snapshot = await getDocs(downloadsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting downloaded songs:', error);
    return [];
  }
};

export const playDownloadedSong = async (localUri) => {
  try {
    if (!localUri) {
      throw new Error('Missing local URI for downloaded song');
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: localUri },
      { shouldPlay: true }
    );
    return sound;
  } catch (error) {
    console.error('Error playing downloaded song:', error);
    throw error;
  }
};

export const removeDownloadedSong = async (userId, songId) => {
  try {
    const songRef = doc(db, 'users', userId, 'downloads', songId);
    await deleteDoc(songRef);
    return true;
  } catch (error) {
    console.error('Error removing downloaded song:', error);
    return false;
  }
}; 