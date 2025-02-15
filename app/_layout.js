import { Slot } from 'expo-router';
import { AuthProvider } from "../context/AuthContext";
import { useState, useEffect } from 'react';
import SplashScreen from '../components/SplashScreen';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <Slot screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: 'white' }
      }} />
    </AuthProvider>
  );
}