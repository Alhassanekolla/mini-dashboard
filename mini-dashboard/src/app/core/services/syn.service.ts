import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, retry, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { OfflineService } from './offline.service';
import { CartService } from '../../features/cart/services/cart.service';

export interface SyncState {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message: string;
  lastSync?: Date;
  syncedItems?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncState = new BehaviorSubject<SyncState>({
    status: 'idle',
    message: 'Prêt à synchroniser'
  });

  public syncState$ = this.syncState.asObservable();

  constructor(
    private apiService: ApiService,
    private offlineService: OfflineService,
    private cartService: CartService
  ) {}

  // 🔥 SYNCHRONISATION AVEC RETRY LOGIC
  syncData(): Observable<any> {
    if (!this.offlineService.isOnline()) {
      this.updateState('error', '❌ Impossible de synchroniser : hors ligne');
      return throwError(() => new Error('Offline'));
    }

    const cartItems = this.cartService.getCurrentItems();

    if (cartItems.length === 0) {
      this.updateState('success', '✅ Rien à synchroniser - panier vide');
      return of(null);
    }

    this.updateState('syncing', `🔄 Synchronisation de ${cartItems.length} articles...`);

    return this.apiService.syncCart(cartItems).pipe(
      // 🔥 RETRY LOGIC - 3 tentatives avec délai
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.log(`Tentative ${retryCount} échouée, retry dans 2s...`, error);
          this.updateState('syncing', `🔄 Synchronisation (tentative ${retryCount}/3)...`);
          return of(null).pipe(delay(2000));
        }
      }),

      tap((response) => {
        // 🔥 SUCCÈS - On garde le panier visible pour l'utilisateur
        this.updateState('success', `✅ Synchronisation réussie ! ${cartItems.length} articles envoyés.`);

        // On sauvegarde le nombre d'articles synchronisés pour affichage
        this.syncState.next({
          ...this.syncState.value,
          syncedItems: cartItems.length
        });
      }),

      catchError(error => {
        // 🔥 ÉCHEC FINAL
        console.error('Échec de la synchronisation après 3 tentatives:', error);
        this.updateState('error', '❌ Échec de la synchronisation après plusieurs tentatives');
        return throwError(() => error);
      })
    );
  }

  // 🔥 VIDER LE PANIER APRÈS CONFIRMATION
  clearCartAfterSync(): void {
    this.cartService.clearCart();
    this.updateState('idle', 'Panier vidé après synchronisation');
  }

  // 🔥 SYNCHRONISATION AUTOMATIQUE QUAND ONLINE
  autoSyncWhenOnline(): void {
    this.offlineService.onConnectionChange(async (online: boolean) => {
      if (online) {
        const hasPendingData = await this.offlineService.hasPendingData();
        if (hasPendingData && this.syncState.value.status !== 'syncing') {
          // On attend 2 secondes avant la synchro auto pour laisser l'utilisateur voir le changement
          setTimeout(() => {
            this.updateState('syncing', '🔗 Reconnexion détectée - synchronisation automatique...');
            this.syncData().subscribe();
          }, 2000);
        }
      }
    });
  }

  private updateState(status: SyncState['status'], message: string): void {
    this.syncState.next({
      status,
      message,
      lastSync: status === 'success' ? new Date() : this.syncState.value.lastSync
    });
  }

  // Reset du state
  resetState(): void {
    this.updateState('idle', 'Prêt à synchroniser');
  }
}
