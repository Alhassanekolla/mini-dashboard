# 🏗️ Documentation Architecture - Mini Dashboard

## 🎯 Justification des Choix Techniques




### 1. Angular 18 avec Standalone Components
Choix : Composants standalone plutôt que NgModules  
Justification : 
- Réduction de la complexité boilerplate
- Meilleure performance au chargement initial
- Alignement avec la roadmap d'Angular
- Lazy loading natif plus simple à implémenter

### 2. Pagination Locale vs Serveur
Choix : Pagination côté client  
Justification :
- Jeu de données limité : Moins de 50 produits
- Performance UX : Réactivité immédiate
- Fonctionnement offline : Pagination disponible sans connexion
- Réduction appels API : Une seule requête initiale

### 3. Dexie.js vs IndexedDB Natif
Choix : Dexie.js comme abstraction IndexedDB  
Justification :
- API simplifiée : Syntaxe plus intuitive que l'API native
- Support TypeScript : Typage fort natif
- Gestion transactions : Simplifiée et plus robuste
- Communauté active : Maintenance et support assurés

### 4. Gestion d'État avec Services + RxJS
Choix : Services avec BehaviorSubject plutôt que NgRx  
Justification :
- Complexité adaptée : NgRx overkill pour ce scope
- Courbe d'apprentissage : Plus accessible
- Intégration naturelle : Parfait avec l'écosystème Angular/RxJS
- Maintenabilité : Code plus simple à comprendre et debugger

### 5. Bootstrap vs Angular Material
Choix : Bootstrap  
Justification :
- Rapidité de développement : Classes utilitaires
- Flexibilité : Plus facile de customiser le design
- Familiarté : Connaissance plus répandue dans les équipes

## 🔧 Patterns d'Architecture

### Architecture Feature-Based





### Séparation des Responsabilités
- Core : Services transverses (API, offline, sync)
- Shared : Éléments réutilisables (models, composants UI)
- Features : Logique métier spécifique


