import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Product } from '../../shared/models/product.model';
import { CartItem } from '../../shared/models/cart-item.model';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  // 🔥 SIMULATION DE SYNCHRONISATION AVEC ERREURS ALÉATOIRES
  syncCart(cartItems: CartItem[]): Observable<any> {
    console.log('📤 Envoi du panier à l\'API:', cartItems);

    // Simulation d'erreur aléatoire pour tester le retry (20% de chance)
    if (Math.random() < 0.2) {
      return throwError(() => new Error('💥 Erreur serveur simulée'));
    }

    // Simulation d'un appel API réussi
    return of({
      success: true,
      message: 'Panier synchronisé avec succès',
      orderId: Math.floor(Math.random() * 1000),
      items: cartItems
    }).pipe(
      delay(1000) // Simulation délai réseau
    );

    // Version réelle (décommente pour utiliser avec json-server) :
    // return this.http.post(`${this.apiUrl}/orders`, {
    //   items: cartItems,
    //   timestamp: new Date().toISOString(),
    //   total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    // });
  }
}
