import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, timer } from 'rxjs';
import { catchError, delay, retryWhen, switchMap, tap, take } from 'rxjs/operators';
import { ApiService } from './api.service';
import { OfflineService } from './offline.service';
import { CartService } from '../../features/cart/services/cart.service';

export interface SyncState {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message: string;
  lastSync?: Date;
  syncedItems?: number;
  retryCount?: number;
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
  private isSyncing = false;

  constructor(
    private apiService: ApiService,
    private offlineService: OfflineService,
    private cartService: CartService
  ) {}

  // 🔥 SYNCHRONISATION AVEC RETRY LOGIC AMÉLIORÉE
  syncData(): Observable<any> {
    if (this.isSyncing) {
      return of(null); // Éviter les synchronisations simultanées
    }

    if (!this.offlineService.isOnline()) {
      this.updateState('error', '❌ Impossible de synchroniser : hors ligne');
      return throwError(() => new Error('Offline'));
    }

    const cartItems = this.cartService.getCurrentItems();

    if (cartItems.length === 0) {
      this.updateState('success', '✅ Rien à synchroniser - panier vide');
      return of(null);
    }

    this.isSyncing = true;
    this.updateState('syncing', `🔄 Synchronisation de ${cartItems.length} articles...`, 0);

    return this.apiService.syncCart(cartItems).pipe(
      // 🔥 RETRY LOGIC AMÉLIORÉE - Vérifie l'état online entre chaque tentative
      retryWhen(errors =>
        errors.pipe(
          switchMap((error, retryCount) => {
            const maxRetries = 3;

            // Vérifier si on est toujours en ligne
            if (!this.offlineService.isOnline()) {
              console.log('Hors ligne - arrêt des tentatives');
              this.updateState('error', '❌ Synchronisation interrompue : connexion perdue');
              this.isSyncing = false;
              return throwError(() => new Error('Offline during retry'));
            }

            if (retryCount >= maxRetries) {
              console.log('Maximum de tentatives atteint');
              this.updateState('error', '❌ Échec de la synchronisation après plusieurs tentatives');
              this.isSyncing = false;
              return throwError(() => error);
            }

            console.log(`Tentative ${retryCount + 1}/${maxRetries} échouée, retry dans 2s...`);
            this.updateState('syncing', `🔄 Synchronisation (tentative ${retryCount + 1}/${maxRetries})...`, retryCount + 1);

            // Attendre 2 secondes avant de réessayer
            return timer(2000);
          })
        )
      ),

      tap((response) => {
        // 🔥 SUCCÈS
        console.log('Synchronisation réussie !');
        this.updateState('success', `✅ Synchronisation réussie ! ${cartItems.length} articles envoyés.`);
        this.isSyncing = false;
      }),

      catchError(error => {
        // 🔥 ÉCHEC FINAL
        console.error('Échec final de la synchronisation:', error);

        // Ne mettre à jour l'état que si ce n'est pas déjà fait dans le retryWhen
        if (this.syncState.value.status !== 'error') {
          const errorMessage = this.offlineService.isOnline()
            ? '❌ Échec de la synchronisation après plusieurs tentatives'
            : '❌ Synchronisation interrompue : hors ligne';

          this.updateState('error', errorMessage);
        }

        this.isSyncing = false;
        return throwError(() => error);
      })
    );
  }

  // 🔥 SYNCHRONISATION AUTOMATIQUE QUAND ONLINE - AMÉLIORÉE
  autoSyncWhenOnline(): void {
    this.offlineService.onConnectionChange(async (online: boolean) => {
      if (online) {
        const hasPendingData = await this.offlineService.hasPendingData();
        const cartItems = this.cartService.getCurrentItems();

        // Synchroniser seulement si on a des données ET qu'on n'est pas déjà en train de synchroniser
        if ((hasPendingData || cartItems.length > 0) && !this.isSyncing && this.syncState.value.status !== 'syncing') {
          console.log('🔗 Reconnexion détectée - lancement de la synchronisation automatique...');

          // On attend 3 secondes pour laisser la connexion se stabiliser
          setTimeout(() => {
            if (this.offlineService.isOnline() && !this.isSyncing) {
              this.updateState('syncing', '🔗 Reconnexion détectée - synchronisation automatique...');
              this.syncData().subscribe({
                error: (error) => {
                  // Ne rien faire - l'erreur est déjà gérée dans syncData
                }
              });
            }
          }, 3000);
        }
      } else {
        // Quand on passe en offline, réinitialiser l'état de sync si on était en train de synchroniser
        if (this.isSyncing || this.syncState.value.status === 'syncing') {
          this.updateState('error', '❌ Synchronisation interrompue : connexion perdue');
          this.isSyncing = false;
        }
      }
    });
  }

  private updateState(status: SyncState['status'], message: string, retryCount?: number): void {
    this.syncState.next({
      status,
      message,
      lastSync: status === 'success' ? new Date() : this.syncState.value.lastSync,
      retryCount
    });
  }

  // Reset du state
  resetState(): void {
    this.isSyncing = false;
    this.updateState('idle', 'Prêt à synchroniser');
  }

  // Vérifier si une synchronisation est en cours
  isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }
}
