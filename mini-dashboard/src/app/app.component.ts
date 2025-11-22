import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CartService } from './features/cart/services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mini-dashboard';


  constructor(public cartService: CartService) {}
}
