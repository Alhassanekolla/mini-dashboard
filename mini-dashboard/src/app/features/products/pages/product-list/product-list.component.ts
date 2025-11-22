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

  nextPage(): void {
    this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }
}
