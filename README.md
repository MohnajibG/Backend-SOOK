
# **SOOK** 🛍️  
Une plateforme de marché en ligne permettant aux utilisateurs de publier, rechercher et gérer des produits avec une architecture complète (frontend, backend, base de données).  

## **Table des matières**  
1. [Aperçu du projet](#apercu-du-projet)  
2. [Fonctionnalités principales](#fonctionnalités-principales)  
3. [Technologies utilisées](#technologies-utilisées)  
4. [Installation](#installation)  
5. [Utilisation](#utilisation)  
6. [Architecture du projet](#architecture-du-projet)  
7. [Contributions](#contributions)  
8. [Contact](#contact)  

---

## **Aperçu du projet**  
**SOOK** (signifiant "marché" en arabe) est une application web de marketplace où les utilisateurs peuvent :  
- Ajouter des produits à vendre.  
- Parcourir les produits disponibles.  
- Gérer leurs profils et préférences.  
- Communiquer avec d'autres utilisateurs via un formulaire sécurisé.

**Démo en ligne :** [SOOK](https://sooki.netlify.app)  
**Frontend GitHub :** [Frontend-SOOK](https://github.com/MohnajibG/Frontend-SOOK)  
**Backend GitHub :** [Backend-SOOK](https://github.com/MohnajibG/Backend-SOOK)  

---

## **Fonctionnalités principales**  
1. **Gestion des utilisateurs :**  
   - Inscription, connexion et mise à jour de profil.  
   - Authentification sécurisée basée sur les cookies.  

2. **Gestion des produits :**  
   - Création, mise à jour et suppression des annonces.  
   - Recherche et filtres avancés pour trouver des produits.  

3. **Intégration des médias :**  
   - Téléchargement et aperçu d'images pour les produits.  

4. **Sécurisation :**  
   - Routes sécurisées pour protéger les données des utilisateurs.  
   - Validation des formulaires côté client et serveur.  

5. **Responsive Design :**  
   - Interface optimisée pour ordinateurs, tablettes et mobiles.  

---

## **Technologies utilisées**  
### **Frontend :**  
- **React** (React Hooks, gestion d'état).  
- **TypeScript** : Sécurité et robustesse du code.  
- **CSS3** : Design responsive et intuitif.  

### **Backend :**  
- **Node.js** et **Express** : API RESTful pour gérer les requêtes et la logique métier.  
- **MongoDB** et **Mongoose** : Gestion de la base de données.  
- **MailerSend** : Envoi d’e-mails sécurisés.  

### **Déploiement :**  
- **Netlify** : Hébergement du frontend.  
- **Northflank** : Hébergement du backend.  

---

## **Installation**  

### **Pré-requis :**  
- Node.js (v16+)  
- MongoDB  
- Yarn (gestionnaire de paquets)  

### **Cloner le dépôt :**  
```bash
git clone https://github.com/MohnajibG/Frontend-SOOK.git
git clone https://github.com/MohnajibG/Backend-SOOK.git
```

### **Installation des dépendances :**  
**Frontend :**  
```bash
cd Frontend-SOOK
yarn install
```

**Backend :**  
```bash
cd Backend-SOOK
yarn install
```

### **Configuration :**  
**Backend** : Créez un fichier `.env` dans le dossier `Backend-SOOK` avec les variables suivantes :  
```env
PORT=5000
MONGO_URI=<Votre_URI_MongoDB>
MAILERSEND_API_KEY=<Votre_API_KEY_MailerSend>
FRONTEND_URL=http://localhost:3000
```

---

## **Utilisation**  
### **Lancer le backend :**  
```bash
cd Backend-SOOK
yarn dev
```

### **Lancer le frontend :**  
```bash
cd Frontend-SOOK
yarn start
```

### **Accès local :**  
- Frontend : `http://localhost:3000`  
- Backend : `http://localhost:5000`  

---

## **Architecture du projet**  
### **Frontend :**  
```
Frontend-SOOK/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.tsx
│   ├── index.tsx
├── public/
├── package.json
```

### **Backend :**  
```
Backend-SOOK/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── index.ts
├── package.json
```

---

## **Contributions**  
Les contributions sont les bienvenues ! Pour contribuer :  
1. Forkez le projet.  
2. Créez une branche pour vos modifications : `git checkout -b feature/amélioration`.  
3. Poussez vos changements : `git push origin feature/amélioration`.  
4. Créez une Pull Request.

---

## **Contact**  
- **Nom :** Guerchaoui Najib  
- **Email :** guerchaoui7@gmail.com  
- **LinkedIn :** [linkedin.com/in/najib-guerchaoui](https://linkedin.com/in/najib-guerchaoui)  
- **GitHub :** [github.com/MohnajibG](https://github.com/MohnajibG)  
