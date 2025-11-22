import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, Subject, tap } from 'rxjs';
import { Product } from '../../../shared/models/product.model';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {



  private productsSubject = new BehaviorSubject<Product[]>([])
  public products$ = this.productsSubject.asObservable();


  private searchFilter = new BehaviorSubject<string>('')
  private categoryFilter = new BehaviorSubject<string>('all');
  private sortBy = new BehaviorSubject<('price-asc' | 'price-desc')>('price-asc')

  constructor(private apiService :ApiService){}

  loadProducts():Observable<Product[]>{
    return this.apiService.getProducts().pipe(
      tap(products =>this.productsSubject.next(products))
    )
  }
  getFilteredProducts(): Observable<Product[]> {
    return combineLatest([
      this.products$,
      this.searchFilter,
      this.categoryFilter,
      this.sortBy
    ]).pipe(
      map(([products, search, category, sort]) => {
        let filtered: Product[] = products;

        // Filtre recherche
        if (search) {
          filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Filtre catégorie
        if (category !== 'all') {
          filtered = filtered.filter(product => product.category === category);
        }

        // Tri
        if (sort === 'price-asc') {
          filtered = [...filtered].sort((a, b) => a.price - b.price);
        } else if (sort === 'price-desc') {
          filtered = [...filtered].sort((a, b) => b.price - a.price);
        }

        return filtered;
      })
    );
  }

  // Setters pour les filtres
  setSearchFilter(search: string): void {
    this.searchFilter.next(search);
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter.next(category);
  }

  setSort(sort: 'price-asc' | 'price-desc'): void {
    this.sortBy.next(sort);
  }

  // Get toutes les catégories uniques
  getCategories(): Observable<string[]> {
    return this.products$.pipe(
      map(products => [...new Set(products.map(p => p.category))])
    );
  }
}
