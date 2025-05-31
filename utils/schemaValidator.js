import { songSchema, playlistSchema, userSchema, analyticsSchema } from './databaseSchema';

// Helper function to check if a value matches the expected type
const checkType = (value, expectedType) => {
  if (expectedType === 'string') return typeof value === 'string';
  if (expectedType === 'number') return typeof value === 'number';
  if (expectedType === 'boolean') return typeof value === 'boolean';
  if (expectedType === 'timestamp') return value instanceof Date || value instanceof Object;
  if (Array.isArray(expectedType)) {
    if (!Array.isArray(value)) return false;
    return value.every(item => checkType(item, expectedType[0]));
  }
  if (typeof expectedType === 'object') {
    if (typeof value !== 'object' || value === null) return false;
    return Object.keys(expectedType).every(key => 
      checkType(value[key], expectedType[key])
    );
  }
  return false;
};

// Validate song data against schema
export const validateSong = (songData) => {
  const errors = [];
  
  Object.entries(songSchema).forEach(([key, expectedType]) => {
    if (!(key in songData)) {
      errors.push(`Missing required field: ${key}`);
    } else if (!checkType(songData[key], expectedType)) {
      errors.push(`Invalid type for field ${key}: expected ${expectedType}, got ${typeof songData[key]}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate playlist data against schema
export const validatePlaylist = (playlistData) => {
  const errors = [];
  
  Object.entries(playlistSchema).forEach(([key, expectedType]) => {
    if (!(key in playlistData)) {
      errors.push(`Missing required field: ${key}`);
    } else if (!checkType(playlistData[key], expectedType)) {
      errors.push(`Invalid type for field ${key}: expected ${expectedType}, got ${typeof playlistData[key]}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate user data against schema
export const validateUser = (userData) => {
  const errors = [];
  
  Object.entries(userSchema).forEach(([key, expectedType]) => {
    if (!(key in userData)) {
      errors.push(`Missing required field: ${key}`);
    } else if (!checkType(userData[key], expectedType)) {
      errors.push(`Invalid type for field ${key}: expected ${expectedType}, got ${typeof userData[key]}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate analytics data against schema
export const validateAnalytics = (analyticsData) => {
  const errors = [];
  
  Object.entries(analyticsSchema).forEach(([key, expectedType]) => {
    if (!(key in analyticsData)) {
      errors.push(`Missing required field: ${key}`);
    } else if (!checkType(analyticsData[key], expectedType)) {
      errors.push(`Invalid type for field ${key}: expected ${expectedType}, got ${typeof analyticsData[key]}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to format validation errors
export const formatValidationErrors = (errors) => {
  return errors.join('\n');
};

// Example usage:
/*
const songData = {
  title: "Example Song",
  artist: "Example Artist",
  // ... other fields
};

const validation = validateSong(songData);
if (!validation.isValid) {
  console.error(formatValidationErrors(validation.errors));
}
*/ 