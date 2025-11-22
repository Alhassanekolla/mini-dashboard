import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Product } from "../../shared/models/product.model";
import { Observable } from "rxjs";









@Injectable({
  providedIn:'root'
})

export class ApiService {
  private baseUrl = 'http://localhost:3000'

  constructor(private http:HttpClient){}

  getProducts():Observable<Product[]>{
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  syncCart(cartIem:any[]):Observable<any>{
    return this.http.post(`${this.baseUrl}/cart`,{items:cartIem})
  }

}
