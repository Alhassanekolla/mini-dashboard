import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from './features/cart/services/cart.service';
import { OfflineService } from './core/services/offline.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule,RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mini-dashboard';
  isOnline: boolean = true;

  constructor(
    public cartService: CartService,
    private offlineService: OfflineService
  ) {}

  ngOnInit(): void {
    this.isOnline = this.offlineService.isOnline();

    // Écouter les changements de connexion
    this.offlineService.onConnectionChange((online: boolean) => {
      this.isOnline = online;
      console.log(`Mode ${online ? 'online' : 'offline'}`);
    });
  }

  ngOnDestroy(): void {}
}
