import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG, handleApiResponse } from '../../utils/config';
import { Ionicons } from '@expo/vector-icons';

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [normalQuantity, setNormalQuantity] = useState('0');
  const [foilQuantity, setFoilQuantity] = useState('0');
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchCardDetails();
  }, [id]);

  const fetchCardDetails = async () => {
    try {
      if (!user?.token) {
        throw new Error('Utilisateur non authentifié');
      }

      console.log('Token utilisé:', user.token);
      const headers = {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      };

      // Récupérer les détails de la carte
      const cardUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CARDS}/${id}`;
      console.log('Requête carte:', cardUrl);
      
      const cardResponse = await fetch(cardUrl, { 
        method: 'GET', 
        headers 
      });

      console.log('Status carte:', cardResponse.status);
      console.log('Headers carte:', Object.fromEntries(cardResponse.headers.entries()));
      const cardText = await cardResponse.text();
      console.log('Réponse carte brute:', cardText);

      try {
        const cardData = JSON.parse(cardText);
        // S'assurer que l'URL de l'image est complète
        if (cardData.image && !cardData.image.startsWith('http')) {
          cardData.image = `https://lorcana.brybry.fr${cardData.image}`;
        }
        setCard(cardData);

        // Récupérer les quantités de la collection
        const collectionUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLLECTION}/${id}`;
        console.log('Requête collection:', collectionUrl);
        
        const collectionResponse = await fetch(collectionUrl, { 
          method: 'GET', 
          headers 
        });

        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();
          setNormalQuantity(collectionData.normalQuantity?.toString() || '0');
          setFoilQuantity(collectionData.foilQuantity?.toString() || '0');
        }

        // Vérifier si la carte est dans la wishlist
        const wishlistUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WISHLIST}/${id}`;
        console.log('Requête wishlist:', wishlistUrl);
        
        const wishlistResponse = await fetch(wishlistUrl, { 
          method: 'GET', 
          headers 
        });

        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          setIsInWishlist(!!wishlistData?.inWishlist);
        }

      } catch (e) {
        console.error('Erreur de parsing:', e);
        if (cardText.includes('<')) {
          console.error('La réponse semble être du HTML. Vérification du token...');
          // Si on reçoit du HTML, c'est probablement un problème d'authentification
          Alert.alert(
            'Session expirée',
            'Votre session a expiré. Veuillez vous reconnecter.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Rediriger vers la page de connexion
                  router.replace('/auth/login');
                }
              }
            ]
          );
          return;
        }
        throw e;
      }
    } catch (error) {
      console.error('Error fetching card details:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de la carte');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCollection = async (isFoil = false) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/me/${id}/update-owned`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          normalQty: isFoil ? normalQuantity : (parseInt(normalQuantity) + 1).toString(),
          foilQty: isFoil ? (parseInt(foilQuantity) + 1).toString() : foilQuantity
        }),
      });

      if (response.ok) {
        // Mettre à jour les quantités localement
        if (isFoil) {
          setFoilQuantity(prev => (parseInt(prev) + 1).toString());
        } else {
          setNormalQuantity(prev => (parseInt(prev) + 1).toString());
        }
        Alert.alert('Succès', 'Carte ajoutée à votre collection');
      } else {
        const errorText = await response.text();
        console.error('Erreur lors de l\'ajout à la collection:', errorText);
        Alert.alert('Erreur', 'Impossible d\'ajouter la carte à votre collection');
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout de la carte');
    } finally {
      setIsLoading(false);
    }
  };

  const getCardImageUrl = (cardId) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CARD_IMAGE.replace(':id', cardId)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la carte</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
        </View>
      ) : card ? (
        <View style={styles.content}>
          <Image
            source={{ uri: getCardImageUrl(id) }}
            style={styles.cardImage}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
          
          <View style={styles.cardDetails}>
            <Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.cardType}>{card.type || 'Type non spécifié'}</Text>
            
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Dans votre collection :</Text>
              <Text style={styles.quantityText}>Normal : {normalQuantity}</Text>
              <Text style={styles.quantityText}>Brillante : {foilQuantity}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.normalButton]}
                onPress={() => addToCollection(false)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Ajouter (Normal)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.foilButton]}
                onPress={() => addToCollection(true)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>Ajouter (Brillante)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Carte non trouvée</Text>
        </View>
      )}
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
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardImage: {
    width: '100%',
    height: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  cardDetails: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  quantitySection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quantityText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  normalButton: {
    backgroundColor: '#4a90e2',
  },
  foilButton: {
    backgroundColor: '#ff9900',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
});