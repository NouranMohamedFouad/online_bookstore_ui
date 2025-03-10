import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersRequestsService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getOrdersList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders`);
  }
  getBookbyId(bookId: string): Observable<any> {
      return this.http.get(`${this.baseUrl}/books/objectId/${bookId}`);
    }
}
