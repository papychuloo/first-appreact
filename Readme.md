
# Lorcana Mobile

## Description
Lorcana Mobile est une application développée en **React Native avec Expo** permettant aux utilisateurs de gérer leur collection de cartes, leurs chapitres et leur wishlist en se connectant à l'API [lorcana.brybry.fr](https://lorcana.brybry.fr/).

## Fonctionnalités

### 1. Authentification
- Inscription avec email et mot de passe
- Connexion et déconnexion

### 2. Gestion des cartes
- Affichage des cartes par chapitre
- Filtrage et recherche des cartes (possession, wishlist)
- Ajout de cartes à la collection
- Mise à jour des quantités (normales et brillantes)

### 3. Gestion des chapitres
- Affichage de la liste des chapitres

### 4. Wishlist
- Ajout et suppression de cartes dans la wishlist
- Affichage des cartes uniquement dans la wishlist

## Installation et Configuration

### Prérequis
- Node.js (version LTS recommandée)
- Expo CLI installé globalement (`npm install -g expo-cli`)
- Un compte GitHub

### Installation
1. Clonez ce dépôt :
   ```sh
   git clone https://github.com/votre-utilisateur/first_appreact.git
   ```
2. Accédez au dossier du projet :
   ```sh
   cd first_appreact
   ```
3. Installez les dépendances :
   ```sh
   npm install
   ```
4. Démarrez l'application avec Expo :
   ```sh
   npx expo start



5. Tester l’application sur un appareil physique en scannant le QRcode
   
   ```

## Technologies utilisées
- **React Native** avec **Expo** pour le développement mobile
- **Expo Router** pour la navigation
- **Expo Image** pour la gestion des images
- **Context API** pour la gestion de l'état global
- **Fetch API** pour les requêtes vers l'API

## Structure du projet

FIRST-APPREACT
│── .expo/
│── app/
│   ├── account/
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   ├── cards/
│   │   ├── [id].js
│   ├── chapters/
│   │   ├── [id]/cards/
│   │   │   ├── _layout.js
│   │   │   ├── [id].js
│   │   │   ├── index.js
│   ├── collection/
│   │   ├── _layout.js
│   │   ├── index.js
│   │   ├── wishlist.js
│   ├
│   ├── _layout.js
│   ├── account.js
│   ├── index.js
│   ├── profile.js
│── assets/
│   ├── adaptive-icon.png
│   ├── disney-lorcana-logo.jpg
│   ├── favicon.png
│   ├── icon.png
│   ├── splash-icon.png
│── components/
│   ├── CardItem.js
│   ├── ChapterItem.js
│   ├── SplashScreen.js
│── context/
│   ├── AuthContext.js
│   ├── CollectionContext.js
│── utils/
│   ├── api.js
│   ├── config.js
│── .gitignore
│── app.json
│── package.json
│── package-lock.json
│── README.md


## API
Toutes les requêtes respectent la documentation officielle de l'API : [lorcana.brybry.fr](https://lorcana.brybry.fr/).

### Exemple de requête (Fetch API)
```js
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
    } };

## Déploiement
1. Construire l’application avec Expo :
   ```sh
   npx expo build:android
   ```
   ou
   ```sh
   npx expo build:ios
   ```
2. Tester l’application sur un appareil physique 
3. Publier l’application avec Expo :
   ```sh
   npx expo publish
   ```

## Contributions
Les contributions sont les bienvenues ! Pour proposer des modifications :
1. **Forkez** le dépôt
2. Créez une **branche** (`git checkout -b feature-nouvelle-fonction`)
3. **Commitez** vos changements (`git commit -m "Ajout d'une nouvelle fonctionnalité"`)
4. **Pushez** la branche (`git push origin feature-nouvelle-fonction`)
5. Ouvrez une **pull request**

## Contact
Si vous avez des questions ou suggestions, n’hésitez pas à me contacter !

---
✨ Bon développement ! 🚀

