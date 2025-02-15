import { API_CONFIG } from './config';

export const addToWishlist = async (token, cardId) => {
  return fetch(`https://lorcana.brybry.fr/wishlist`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ cardId }),
  });
};

export const addToCollection = async (token, cardId, quantity = 1, isFoil = false) => {
  return fetch(`https://lorcana.brybry.fr/api/collection/add`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ 
      cardId: cardId,
      normalQty: isFoil ? 0 : quantity,
      foilQty: isFoil ? quantity : 0
    }),
  });
};

export const updateCollection = async (token, cardId, normalQty = 0, foilQty = 0) => {
  return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLLECTION_UPDATE.replace(':id', cardId)}`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ 
      normalQty,
      foilQty
    }),
  });
};

export const getCollection = async (token) => {
  return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLLECTION}`, {
    method: "GET",
    headers: { 
      "Authorization": `Bearer ${token}`, 
      "Content-Type": "application/json" 
    }
  });
};