import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebaseConfig'; // your firebase config file
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // for splash/loading screen
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    console.log('AuthContext - Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthContext - Auth state changed:', user?.email);
      setUser(user);
      
      if (user) {
        try {
          console.log('AuthContext - Fetching user data for uid:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          console.log('AuthContext - User data fetched:', userData);
          
          setUserData(userData);
          const isUserAdmin = userData?.role === 'admin';
          console.log('AuthContext - Setting isAdmin to:', isUserAdmin);
          setIsAdmin(isUserAdmin);
        } catch (error) {
          console.error('AuthContext - Error fetching user data:', error);
          setUserData(null);
          setIsAdmin(false);
        }
      } else {
        console.log('AuthContext - No user, clearing state');
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('AuthContext - Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Signup function
  const signup = async (email, password) => {
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document with default role
      const userData = {
        email: user.email,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        displayName: email.split('@')[0],
        settings: {
          audioQuality: 'high',
          downloadQuality: 'high',
          theme: 'dark',
          notifications: true
        }
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      setUser(user);
      setUserData(userData);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please use a different email or login.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email format.');
      } else {
        throw new Error('Failed to create account. Please try again.');
      }
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log('AuthContext - Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext - Login successful, user:', userCredential.user);
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      console.log('AuthContext - User data fetched:', userData);
      
      setUserData(userData);
      const isUserAdmin = userData?.role === 'admin';
      console.log('AuthContext - Setting isAdmin to:', isUserAdmin);
      setIsAdmin(isUserAdmin);
      
      return userCredential;
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('AuthContext - Attempting logout');
      await signOut(auth);
      console.log('AuthContext - Logout successful');
      setUser(null);
      setUserData(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('AuthContext - Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      signup, 
      login, 
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
