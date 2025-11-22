import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { CartItem } from '../../shared/models/cart-item.model';
import { Product } from '../../shared/models/product.model';
// Database Schema
interface AppDatabase extends Dexie {
  products: Dexie.Table<Product, number>;
  cart: Dexie.Table<CartItem, number>;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private db: AppDatabase;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db = new Dexie('MiniDashboardDB') as AppDatabase;

    this.db.version(1).stores({
      products: '++id, name, price, category',
      cart: '++id, productId, name, price, quantity'
    });
  }

  // 🔥 PRODUITS
  // Sauvegarder les produits en local
  async saveProducts(products: Product[]): Promise<void> {
    await this.db.products.clear();
    await this.db.products.bulkAdd(products);
  }

  // Récupérer les produits depuis le local
  async getProducts(): Promise<Product[]> {
    return await this.db.products.toArray();
  }

  // 🔥 PANIER
  // Sauvegarder le panier
  async saveCart(cartItems: CartItem[]): Promise<void> {
    await this.db.cart.clear();
    if (cartItems.length > 0) {
      await this.db.cart.bulkAdd(cartItems);
    }
  }

  // Récupérer le panier
  async getCart(): Promise<CartItem[]> {
    return await this.db.cart.toArray();
  }

  // 🔥 SYNCHRONISATION
  // Vérifier s'il y a des données en attente
  async hasPendingData(): Promise<boolean> {
    const cartItems = await this.getCart();
    return cartItems.length > 0;
  }

  // Nettoyer les données après synchro réussie
  async clearCart(): Promise<void> {
    await this.db.cart.clear();
  }

  // 🔥 DÉTECTION CONNEXION
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Écouter les changements de connexion
  onConnectionChange(callback: (online: boolean) => void): void {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }
}
