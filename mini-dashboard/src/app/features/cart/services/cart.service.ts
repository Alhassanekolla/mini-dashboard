import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem } from '../../../shared/models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItems.asObservable();

  // Observable pour le total
  public total$ = this.cartItems$.pipe(
    map(items => this.calculateTotal(items))
  );

  // Observable pour le nombre d'items
  public itemCount$ = this.cartItems$.pipe(
    map(items => items.reduce((sum, item) => sum + item.quantity, 0))
  );

  // 🔥 FONCTION D'OPTIMISATION ALGORITHMIQUE
  private optimizeCartItems(items: CartItem[]): CartItem[] {
    const mergedMap = new Map<number, CartItem>();

    items.forEach(item => {
      if (mergedMap.has(item.productId)) {
        // Si le produit existe déjà, on additionne les quantités
        const existingItem = mergedMap.get(item.productId)!;
        existingItem.quantity += item.quantity;
      } else {
        // Sinon on ajoute le produit
        mergedMap.set(item.productId, { ...item });
      }
    });

    return Array.from(mergedMap.values());
  }

  // Ajouter au panier + optimisation automatique
  addToCart(newItem: CartItem): void {
    const currentItems = this.cartItems.value;
    const updatedItems = this.optimizeCartItems([...currentItems, newItem]);
    this.cartItems.next(updatedItems);
  }

  // Mettre à jour la quantité
  updateQuantity(productId: number, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems.value.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );

    this.cartItems.next(currentItems);
  }

  // Supprimer du panier
  removeFromCart(productId: number): void {
    const currentItems = this.cartItems.value.filter(
      item => item.productId !== productId
    );
    this.cartItems.next(currentItems);
  }

  // Vider le panier
  clearCart(): void {
    this.cartItems.next([]);
  }

  // Calculer le total
  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Getter pour les items actuels (pour la synchro)
  getCurrentItems(): CartItem[] {
    return this.cartItems.value;
  }
}
