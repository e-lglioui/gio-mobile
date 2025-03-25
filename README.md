# Master's Portal - Mobile

Master's Portal est une application mobile conçue pour simplifier la gestion des écoles de Kung Fu au Maroc. Grâce à une interface conviviale, les utilisateurs peuvent rechercher des écoles, suivre leurs certifications sportives et s'inscrire à des événements.

## 🚀 Fonctionnalités principales

- **Géolocalisation des Écoles** : Visualisez les écoles de Kung Fu proches sur une carte interactive.
- **Enregistrement et Connexion** : Système d'authentification sécurisé.
- **Gestion des Certifications** : Suivez votre progression et téléchargez vos certifications.
- **Paiements Sécurisés** : Effectuez des paiements directement via l’application.
- **Organisation d’Événements** : Inscrivez-vous et obtenez vos tickets.

## 🛠️ Technologies utilisées

- **Framework Mobile** : Expo (React Native)
- **Gestion de l’État** : Redux Toolkit
- **API Mapping** : React Native Maps
- **Géolocalisation** : Expo Location
- **Paiements** : Stripe
- **Notifications** : Expo Notifications

## 📦 Prérequis

- Node.js et npm installés
- Expo CLI installé
- Compte Stripe pour les paiements

## ⚙️ Installation

1. **Cloner le dépôt** :
    ```bash
    git clone https://github.com/e-lglioui/gio-mobile.git
    cd masters-portal-mobile
    ```
2. **Installer les dépendances** :
    ```bash
    npm install
    ```
3. **Configurer les variables d’environnement** :
    Créez un fichier `.env` à la racine et ajoutez :
    ```env
    API_URL=http://localhost:3000/api
    STRIPE_PUBLIC_KEY=your_stripe_public_key
    MAPS_API_KEY=your_google_maps_api_key
    ```
4. **Lancer l’application** :
    ```bash
    npx expo start
    ```

## 📧 Configuration de Stripe

- Créez un compte Stripe.
- Récupérez votre clé publique Stripe et ajoutez-la dans le fichier `.env`.

## 🚀 Déploiement

Pour construire une application mobile :
```bash
npx expo build:android
npx expo build:ios
```

## 📝 Contribution

Les contributions sont les bienvenues ! N’hésitez pas à ouvrir une issue ou une pull request.

## 📧 Contact

Pour toute question, contactez-nous à : elgliouif@gmail.com



