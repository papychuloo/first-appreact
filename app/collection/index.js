 import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../utils/config';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCollection } from '../../utils/api';

export default function CollectionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalCards: 0,
    uniqueCards: 0,
    foilCards: 0
  });

  useEffect(() => {
    fetchCollection();
  }, []);

  const fetchCollection = async () => {
    try {
      if (!user?.token) {
        router.replace('/auth/login');
        return;
      }

      const response = await getCollection(user.token);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.replace('/auth/login');
          return;
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      const cards = data.data || [];

      setCards(cards);
      
      // Calculer les statistiques
      const totalCards = cards.reduce((sum, card) => 
        sum + (parseInt(card.normalQty) || 0) + (parseInt(card.foilQty) || 0), 0);
      const uniqueCards = cards.length;
      const foilCards = cards.filter(card => parseInt(card.foilQty) > 0).length;

      setStats({
        totalCards,
        uniqueCards,
        foilCards
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la collection:', error);
      Alert.alert(
        'Erreur',
        'Impossible de récupérer votre collection. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCards = cards.filter(card => {
    const query = searchQuery.toLowerCase();
    return (
      card.name.toLowerCase().includes(query) ||
      card.type?.toLowerCase().includes(query) ||
      card.rarity?.toLowerCase().includes(query)
    );
  });

  const renderCard = ({ item }) => {
    const imageUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CARD_IMAGE.replace(':id', item.id)}`;
    
    return (
      <TouchableOpacity 
        style={styles.cardItem}
        onPress={() => router.push(`/cards/${item.id}`)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="contain"
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardType}>{item.type || 'Type non spécifié'}</Text>
          <View style={styles.quantityInfo}>
            <Text style={styles.quantityText}>
              Normal: {item.normalQty || 0}
            </Text>
            <Text style={styles.quantityText}>
              Brillante: {item.foilQty || 0}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    );
  };

  const handleAddToCollection = async (cardId, isFoil = false) => {
    try {
      const response = await addToCollection(cardId, 1, isFoil);
      if (response.ok) {
        // Rafraîchir la collection après l'ajout
        fetchCollection();
      } else {
        console.error('Erreur lors de l\'ajout à la collection');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ma Collection</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalCards}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.uniqueCards}</Text>
          <Text style={styles.statLabel}>Uniques</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.foilCards}</Text>
          <Text style={styles.statLabel}>Brillantes</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une carte..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Chargement de votre collection...</Text>
        </View>
      ) : cards.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="card-outline" size={50} color="#666" />
          <Text style={styles.emptyText}>Votre collection est vide</Text>
          <Text style={styles.emptySubText}>Ajoutez des cartes pour les voir ici</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCards}
          renderItem={renderCard}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.cardGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  cardGrid: {
    padding: 5,
  },
  cardItem: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  cardInfo: {
    padding: 8,
  },
  cardName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  quantityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityText: {
    fontSize: 12,
    color: '#4a90e2',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
});
