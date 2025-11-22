import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, from } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { Product } from '../../../shared/models/product.model';
import { OfflineService } from '../../../core/services/offline.service';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  // Filtres réactifs
  private searchFilter = new BehaviorSubject<string>('');
  private categoryFilter = new BehaviorSubject<string>('all');
  private sortBy = new BehaviorSubject<'price-asc' | 'price-desc'>('price-asc');

  constructor(
    private http: HttpClient,
    private offlineService: OfflineService
  ) {}

  // 🔥 CHARGEMENT INTELLIGENT : Online → API, Offline → Local
  loadProducts(): Observable<Product[]> {
    if (this.offlineService.isOnline()) {
      // Mode ONLINE : API + sauvegarde locale
      return this.http.get<Product[]>('http://localhost:3000/products').pipe(
        tap(products => {
          this.productsSubject.next(products);
          this.offlineService.saveProducts(products); // Sauvegarde locale
        }),
        catchError(error => {
          console.error('API error, loading from local...', error);
          return this.loadFromLocal(); // Fallback local
        })
      );
    } else {
      // Mode OFFLINE : Local seulement
      return this.loadFromLocal();
    }
  }

  // Chargement depuis le stockage local
  private loadFromLocal(): Observable<Product[]> {
    return from(this.offlineService.getProducts()).pipe(
      tap(products => {
        if (products.length > 0) {
          this.productsSubject.next(products);
        } else {
          console.warn('Aucun produit en cache local');
        }
      })
    );
  }

  // Le reste du code reste identique...
  getFilteredProducts(): Observable<Product[]> {
    return combineLatest([
      this.products$,
      this.searchFilter,
      this.categoryFilter,
      this.sortBy
    ]).pipe(
      map(([products, search, category, sort]) => {
        let filtered = products;

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

  // Setters pour les filtres (inchangés)
  setSearchFilter(search: string): void {
    this.searchFilter.next(search);
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter.next(category);
  }

  setSort(sort: 'price-asc' | 'price-desc'): void {
    this.sortBy.next(sort);
  }

  getCategories(): Observable<string[]> {
    return this.products$.pipe(
      map(products => [...new Set(products.map(p => p.category))])
    );
  }
}
