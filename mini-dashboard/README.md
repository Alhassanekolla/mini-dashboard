# 🛍️ Mini Dashboard - Angular Technical Test

## 📋 Description
Application e-commerce démonstrative construite avec **Angular ** mettant en œuvre :
- Catalogue produits avec filtres, recherche et pagination
- Panier avec optimisation algorithmique  
- Mode offline avec persistance des données
- Synchronisation automatique avec retry logic

## 🚀 Installation et Démarrage

### Prérequis
- **Node.js** (version 18 ou supérieure)
- **Angular CLI (version 18.2.0)** : `npm install -g @angular/cli`



### 📥 Installation

# 1. Cloner le repository
git clone https://github.com/Alhassanekolla/mini-dashboard.git
cd mini-dashboard

# 2. Installer les dépendances
npm install
`

## Démarrage de l'Application

# Démarrer le serveur de mock API
npx json-server --watch db.json --port 3000

# Démarrer l'application Angular
ng serve



### 🌐 Accès aux Applications
# Application Frontend : 
    http://localhost:4200
# API Mock : 
    http://localhost:3000



### Structure du projet 

mini-dashboard/
├── 📄 README.md                          # Documentation principale
├── 📄 ARCHITECTURE.md                    # Documentation technique détaillée
├── 📄 HISTORIQUE_GIT.md                    # Historique git
├── 📄 db.json                            # Base de données mock
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📄 app.config.ts      # Configuration Angular
│   │   ├── 📄 app.routes.ts      # Routing de l'application
│   │   ├── 📄 app.component.ts    # Composant racine
│   │   ├── 📄 app.component.html     # Template racine
│   │   ├── 📁 core/                  # Services fondamentaux
│   │   │   ├── 📁 services/
│   │   │   │   ├── 📄 api.service.ts     # Communication avec l'API
│   │   │   │   ├── 📄 offline.service.ts # Gestion du mode offline
│   │   │   │   └── 📄 sync.service.ts    # Synchronisation des données

│   │   ├── 📁 shared/                    # Éléments réutilisables
│   │   │   ├── 📁 models/                # Interfaces TypeScript
│   │   │   │   ├── 📄 product.interface.ts
│   │   │   │   └── 📄 cart-item.interface.ts
│   │   │   ├── 📁 components/            # Composants réutilisables
│   │   └── 📁 features/                  # Fonctionnalités métier
│   │       ├── 📁 products/              # Module produits
│   │       │   ├── 📁 pages/
│   │       │   │   └── 📁 product-list/
│   │       │   │       ├── 📄 product-list.component.ts
│   │       │   │       ├── 📄 product-list.component.html
│   │       │   │       └── 📄 product-list.component.scss
│   │       │   └── 📁 services/
│   │       │       └── 📄 product.service.ts
│   │       └── 📁 cart/                  # Module panier
│   │           ├── 📁 pages/
│   │           │   └── 📁 cart-list/
│   │           │       ├── 📄 cart-list.component.ts
│   │           │       ├── 📄 cart-list.component.html
│   │           │       └── 📄 cart-list.component.scss
│   │           └── 📁 services/
│   │               └── 📄 cart.service.ts
│   └── 📁 assets/                        # Ressources statiques




### 🎯 Fonctionnalités Implémentées
## ✅ Catalogue Produits
  Affichage grid des produits
  Filtrage par catégorie et recherche texte
  Tri par prix (croissant/décroissant)
  Pagination locale

✅ Gestion du Panier
  Ajout/Modification/Suppression d'articles
  Calcul automatique du total
  Algorithme d'optimisation : regroupement articles similaires

✅ Mode Offline & Synchronisation
  Persistance des données en local (IndexedDB)
  Fonctionnement complet hors ligne
  Synchronisation manuelle et automatique
  Retry logic (3 tentatives automatiques)


# Développé avec Angular 18 • RxJS • Bootstrap • Dexie.js
