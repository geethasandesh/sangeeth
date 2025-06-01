// Database Schema Definitions

// Song Schema
export const songSchema = {
  // Basic Information
  title: 'string',
  artist: 'string',
  album: 'string',
  genre: ['string'], // Array of genres
  duration: 'number', // in milliseconds
  releaseDate: 'timestamp',
  
  // Media URLs
  audioUrl: 'string', // Cloudinary URL
  albumArtUrl: 'string', // Cloudinary URL
  
  // Metadata
  bitrate: 'number',
  format: 'string',
  size: 'number', // in bytes
  
  // Additional Information
  lyrics: 'string',
  language: 'string',
  mood: ['string'], // ['happy', 'sad', 'energetic', etc.]
  tags: ['string'],
  
  // Statistics
  playCount: 'number',
  likeCount: 'number',
  
  // Timestamps
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
  
  // License Information
  license: {
    type: 'string',
    source: 'string',
    attribution: 'string'
  }
};

// Playlist Schema
export const playlistSchema = {
  name: 'string',
  description: 'string',
  coverImageUrl: 'string',
  createdBy: 'string', // user ID
  isPublic: 'boolean',
  songs: ['string'], // array of song IDs
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// User Schema
export const userSchema = {
  // Basic Info
  displayName: 'string',
  email: 'string',
  photoURL: 'string',
  role: 'string', // 'admin', 'employee', or 'user'
  
  // Music Preferences
  favoriteGenres: ['string'],
  favoriteArtists: ['string'],
  
  // User Collections
  likedSongs: ['string'], // array of song IDs
  playlists: ['string'], // array of playlist IDs
  recentlyPlayed: [{
    songId: 'string',
    timestamp: 'timestamp'
  }],
  
  // Settings
  settings: {
    audioQuality: 'string',
    downloadQuality: 'string',
    theme: 'string',
    notifications: 'boolean'
  }
};

// Analytics Schema
export const analyticsSchema = {
  userId: 'string',
  songId: 'string',
  action: 'string', // 'play', 'like', 'download', etc.
  timestamp: 'timestamp',
  deviceInfo: {
    platform: 'string',
    version: 'string'
  },
  location: {
    country: 'string',
    city: 'string'
  }
};

// Example song data structure
export const exampleSong = {
  title: "Example Song",
  artist: "Example Artist",
  album: "Example Album",
  genre: ["Pop", "Rock"],
  duration: 180000, // 3 minutes in milliseconds
  releaseDate: new Date(),
  audioUrl: "https://cloudinary.com/example-song.mp3",
  albumArtUrl: "https://cloudinary.com/example-art.jpg",
  bitrate: 320,
  format: "mp3",
  size: 5000000, // 5MB in bytes
  lyrics: "Example lyrics...",
  language: "English",
  mood: ["happy", "energetic"],
  tags: ["summer", "party"],
  playCount: 0,
  likeCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  license: {
    type: "royalty-free",
    source: "Example Music Library",
    attribution: "© 2024 Example Artist"
  }
};

// Example playlist data structure
export const examplePlaylist = {
  name: "My Favorite Songs",
  description: "A collection of my favorite tracks",
  coverImageUrl: "https://cloudinary.com/playlist-cover.jpg",
  createdBy: "user123",
  isPublic: true,
  songs: ["song1", "song2", "song3"],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Example user data structure
export const exampleUser = {
  displayName: "John Doe",
  email: "john@example.com",
  photoURL: "https://cloudinary.com/profile.jpg",
  favoriteGenres: ["Pop", "Rock", "Jazz"],
  favoriteArtists: ["Artist1", "Artist2"],
  likedSongs: ["song1", "song2"],
  playlists: ["playlist1", "playlist2"],
  recentlyPlayed: [
    {
      songId: "song1",
      timestamp: new Date()
    }
  ],
  settings: {
    audioQuality: "high",
    downloadQuality: "high",
    theme: "dark",
    notifications: true
  }
};

// Firebase Security Rules
export const firebaseRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Songs collection
    match /songs/{songId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Liked Songs collection
    match /likedSongs/{documentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    // Recently Played collection
    match /recentlyPlayed/{documentId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    // Playlists collection
    match /playlists/{playlistId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && resource.data.createdBy == request.auth.uid;
    }

    // Analytics collection
    match /analytics/{recordId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
  }
}`; 