import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersRequestsService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getOrdersList(userId: number | undefined): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/${userId}`);
  }
  getBookbyId(bookId: string): Observable<any> {
      return this.http.get(`${this.baseUrl}/books/objectId/${bookId}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/orders/${orderId}?status=${status}`, {});
  }
  addOrder(): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`,{});
  }
}
