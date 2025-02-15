import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../utils/config';

export default function ChaptersScreen() {
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user || !user.token) {
        throw new Error('Utilisateur non authentifié');
      }

      console.log('Fetching chapters from:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAPTERS}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAPTERS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` 
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert(
            'Session expirée', 
            'Votre session a expiré. Veuillez vous reconnecter.',
            [{ text: 'OK', onPress: () => logout() }]
          );
          throw new Error('Session expirée');
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur de parsing:', parseError);
        throw new Error('Format de réponse invalide');
      }

      // Ensure we have the correct data structure
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error('Structure de données invalide');
      }

      // Clean and deduplicate the chapters data
      const cleanedChapters = data.data
        .filter(chapter => (
          chapter && 
          typeof chapter === 'object' &&
          chapter.id &&
          chapter.name &&
          chapter.code
        ))
        .reduce((unique, chapter) => {
          // Only add if not already present (based on id)
          if (!unique.some(item => item.id === chapter.id)) {
            unique.push(chapter);
          }
          return unique;
        }, [])
        .sort((a, b) => {
          // Sort by release date, null dates at the end
          if (!a.release_date && !b.release_date) return 0;
          if (!a.release_date) return 1;
          if (!b.release_date) return -1;
          return new Date(a.release_date) - new Date(b.release_date);
        });

      setChapters(cleanedChapters);
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de la récupération des chapitres');
      setIsLoading(false);
    }
  };

  const renderChapterItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chapterItem}
      onPress={() => router.push(`/chapters/${item.id}`)}
    >
      <View style={styles.chapterContent}>
        <Text style={styles.chapterTitle}>{item.name}</Text>
        <Text style={styles.chapterSubtitle}>
         
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Chargement des chapitres...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
        <TouchableOpacity onPress={fetchChapters} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Chapitres Lorcana</Text>
        <TouchableOpacity 
          style={styles.accountIcon} 
          onPress={() => router.push('/account')}
        >
          <Ionicons name="person-circle" size={40} color="#4a90e2" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={chapters}
        renderItem={renderChapterItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun chapitre disponible</Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={fetchChapters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  accountIcon: {
    padding: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  chapterItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chapterSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});