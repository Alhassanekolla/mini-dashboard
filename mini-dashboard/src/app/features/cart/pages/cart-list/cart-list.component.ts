import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { CartItem } from '../../../../shared/models/cart-item.model';
import { SyncService, SyncState } from '../../../../core/services/syn.service';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.scss']
})
export class CartListComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  total$: Observable<number>;
  itemCount$: Observable<number>;
  syncState$: Observable<SyncState>;

  constructor(
    private cartService: CartService,
    private syncService: SyncService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.total$ = this.cartService.total$;
    this.itemCount$ = this.cartService.itemCount$;
    this.syncState$ = this.syncService.syncState$;
  }

  ngOnInit(): void {
    this.syncService.autoSyncWhenOnline();
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity - 1);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  // 🔥 SYNCHRONISATION MANUELLE
  syncCart(): void {
    this.syncService.syncData().subscribe({
      error: (error) => {
        // Gestion d'erreur déjà faite dans le service
        console.error('Sync error in component:', error);
      }
    });
  }

  // Reset du state de sync
  resetSyncState(): void {
    this.syncService.resetState();
  }
}
