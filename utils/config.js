export const API_CONFIG = {
    BASE_URL: 'https://lorcana.brybry.fr/api',
    ENDPOINTS: {
      CHAPTERS: '/sets', 
      LOGIN: '/login',
      REGISTER: '/register',
      COLLECTION: '/me/cards',
      COLLECTION_UPDATE: '/me/:id/update-owned',
      WISHLIST: '/wishlist',
      CARDS: '/cards',
      CARD_IMAGE: '/cards/:id/image'
    }
  };
  
  export const handleApiResponse = async (response) => {
    try {
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      // Si la réponse n'est pas OK, on lance une erreur
      if (!response.ok) {
        const text = await response.text();
        console.log('Error response:', text);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Session expirée ou non autorisé');
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const text = await response.text();
      console.log('Response text:', text);

      // Si la réponse est vide ou juste des espaces, on retourne un succès
      if (!text || text.trim() === '') {
        return { success: true };
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Erreur de parsing JSON:', e);
        // Si on ne peut pas parser le JSON mais que la réponse était OK,
        // on considère que c'est un succès
        return { success: true };
      }
    } catch (error) {
      console.error('Erreur handleApiResponse:', error);
      throw error;
    }
  };

  export const createApiRequest = (token) => ({
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });