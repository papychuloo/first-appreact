import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../utils/config';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WishlistScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = router.addListener('focus', () => {
      fetchWishlist();
    });

    fetchWishlist();

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchWishlist = async () => {
    try {
      if (!user?.token) {
        throw new Error('Utilisateur non authentifié');
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WISHLIST}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      if (data.cards) {
        setCards(data.cards);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une carte..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cardItem}
            onPress={() => router.push(`/cards/${item.id}`)}
          >
            <Image
              source={{ uri: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CARD_IMAGE.replace(':id', item.id)}` }}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardType}>{item.type || 'Type non spécifié'}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  cardItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  cardImage: {
    width: 80,
    height: 120,
    marginRight: 10,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    color: '#666',
  },
});
