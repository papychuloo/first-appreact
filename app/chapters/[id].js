import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG } from '../../utils/config';

export default function ChapterDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [chapterCards, setChapterCards] = useState([]);
  const [chapterName, setChapterName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChapterCards();
  }, [id]);

 
  const fetchChapterCards = async () => {
    try {
      if (!user?.token) {
        throw new Error('Utilisateur non authentifié');
      }

      setIsLoading(true);
      console.log('Fetching set details for ID:', id);

      // First fetch set details
      const setResponse = await fetch(`${API_CONFIG.BASE_URL}/sets/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Set response status:', setResponse.status);
      
      if (!setResponse.ok) {
        if (setResponse.status === 401) {
          router.replace('/auth/login');
          throw new Error('Session expirée');
        }
        const errorText = await setResponse.text();
        console.error('Set response error:', errorText);
        throw new Error(`Erreur serveur: ${setResponse.status}`);
      }

      const setData = await setResponse.json();
      console.log('Set data:', setData);
      
      setChapterName(setData.name || 'Chapitre sans nom');

      // Then fetch set cards
      console.log('Fetching cards for set:', id);
      const cardsResponse = await fetch(`${API_CONFIG.BASE_URL}/sets/${id}/cards`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Cards response status:', cardsResponse.status);

      if (!cardsResponse.ok) {
        const errorText = await cardsResponse.text();
        console.error('Cards response error:', errorText);
        throw new Error(`Erreur serveur: ${cardsResponse.status}`);
      }

      const cardsData = await cardsResponse.json();
      console.log('Raw cards data:', cardsData);

      // Handle both possible data structures
      let cards = Array.isArray(cardsData) ? cardsData : cardsData.cards || cardsData.data || [];

      // Log detailed card information
      cards.forEach((card, index) => {
        console.log(`Card ${index + 1}:`, {
          id: card.id,
          name: card.name,
          image: card.image,
          rarity: card.rarity,
          type: card.type,
          allProperties: Object.keys(card)
        });
      });

      setChapterCards(cards);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chapter cards:', error);
      setIsLoading(false);
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors du chargement des cartes',
        [
          { 
            text: 'Réessayer',
            onPress: () => fetchChapterCards()
          },
          {
            text: 'Retour',
            onPress: () => router.back(),
            style: 'cancel'
          }
        ]
      );
    }
  };

  const renderCardItem = ({ item }) => {
    console.log('Rendering card item:', {
      id: item.id,
      name: item.name,
      image: item.image,
      rarity: item.rarity,
      type: item.type,
      allProperties: Object.keys(item)
    });
    
    if (!item) {
      console.log('Received null or undefined item');
      return null;
    }

    // Ensure all required properties exist
    if (!item.id || !item.name) {
      console.error('Invalid card data:', item);
      return null;
    }

    const rawImageUrl = item.image;
    console.log('Raw image URL for card:', item.name, ':', rawImageUrl);

    // Ensure the URL is properly formatted
    let imageUrl = rawImageUrl;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https://${imageUrl}`;
    }

    console.log('Final image URL:', imageUrl);

    return (
      <TouchableOpacity 
        style={styles.cardItem}
        onPress={() => {
          console.log('Navigating to card:', item.id);
          router.push(`/cards/${item.id}`);
        }}
      >
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.cardImage} 
            resizeMode="contain"
            onLoadStart={() => console.log('Starting to load image:', imageUrl)}
            onLoad={() => console.log('Image loaded successfully:', imageUrl)}
            onError={(e) => {
              console.error('Image loading error for card:', item.name);
              console.error('Error details:', e.nativeEvent.error);
              console.error('Failed URL:', imageUrl);
            }}
          />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Text>Image non disponible</Text>
          </View>
        )}
        <View style={styles.cardDetails}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={styles.cardStats}>
            <Text style={styles.cardStatText}>Rareté: {item.rarity || 'N/A'}</Text>
            <Text style={styles.cardStatText}>Type: {item.type || 'N/A'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement des cartes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.chapterTitle} numberOfLines={1}>
          {chapterName || 'Chargement...'}
        </Text>
        <TouchableOpacity 
          style={styles.accountIcon} 
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="person-circle" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>
      
      
      <FlatList
        data={chapterCards}
        renderItem={renderCardItem}
        keyExtractor={item => (item?.id || '').toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Chargement des cartes...' : 'Aucune carte dans ce chapitre'}
            </Text>
          </View>
        }
        onRefresh={fetchChapterCards}
        refreshing={isLoading}
        removeClippedSubviews={false} // This might help with rendering issues
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    padding: 8,
  },
  chapterTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  accountIcon: {
    padding: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  cardItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 100,
    height: 140,
    marginRight: 15,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardStatText: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  }
});