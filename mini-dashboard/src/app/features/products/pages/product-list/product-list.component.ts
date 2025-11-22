import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { map, Observable } from 'rxjs';
import { Product } from '../../../../shared/models/product.model';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  categories$: Observable<string[]>;
  displayedItemsText$: Observable<string>;

  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedSort: 'price-asc' | 'price-desc' = 'price-asc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {
    this.products$ = this.productService.getFilteredProducts();
    this.categories$ = this.productService.getCategories();

   
  }

  ngOnInit(): void {
    this.productService.loadProducts().subscribe();
  }

  onSearchChange(): void {
    this.productService.setSearchFilter(this.searchTerm);
    this.currentPage = 1; // Reset pagination
  }

  onCategoryChange(): void {
    this.productService.setCategoryFilter(this.selectedCategory);
    this.currentPage = 1;
  }

  onSortChange(): void {
    this.productService.setSort(this.selectedSort);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      id: Date.now(), // ID unique temporaire
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  }

  // Pagination
  get paginatedProducts$(): Observable<Product[]> {
    return this.products$.pipe(
      map(products => {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return products.slice(startIndex, startIndex + this.itemsPerPage);
      })
    );
  }

  // Réinitialisation des filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.selectedSort = 'price-asc';
    this.currentPage = 1;
    this.onSearchChange();
    this.onCategoryChange();
    this.onSortChange();
  }

  nextPage(): void {
    this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }



  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOGY4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPsKpSW1hZ2Ugbm9uIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
  }
}
