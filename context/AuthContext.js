import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ensure the context is created outside the provider
export const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Tentative de connexion avec:', { email });
      
      const response = await fetch('https://lorcana.brybry.fr/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Statut de la réponse:', response.status);
      
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      console.log('Données utilisateur reçues:', JSON.stringify(userData, null, 2));
      
      // Assurons-nous que nous avons au moins un token
      if (!userData.token) {
        throw new Error('Token manquant dans la réponse');
      }

      // Stockons uniquement les données nécessaires
      const userToStore = {
        token: userData.token,
        email: email
      };

      console.log('Données à stocker:', JSON.stringify(userToStore, null, 2));
      
      await AsyncStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      return userToStore;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password) => {
    try {
      const response = await fetch('https://lorcana.brybry.fr/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const userData = await response.json();
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};