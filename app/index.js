import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  // Show a loading indicator while checking login status
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f0f4f8'
      }}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  // If user is logged in, redirect to chapters
  // Otherwise, redirect to login
  return user ? <Redirect href="/chapters" /> : <Redirect href="/auth/login" />;
}