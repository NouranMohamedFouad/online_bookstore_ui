import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, timeout, retry } from 'rxjs';
import { HttpRequestsService } from '../http-requests.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersRequestsService {

  private baseUrl = 'https://2f5b52c0e356bf8c8225d94776a10676.serveo.net';

  constructor(
    private http: HttpClient,
    private httpRequestsService: HttpRequestsService
  ) { }

  getAllOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders`);
  }

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
    // Get the authentication token
    const token = this.httpRequestsService.getUserToken();
    
    if (!token) {
      console.error('No authentication token available');
      return throwError(() => new Error('Authentication required to create an order'));
    }
    
    // Set up headers with authentication token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    // Log for debugging
    console.log('Creating order with token:', token.substring(0, 15) + '...');
    
    // Send the authenticated request with an empty object as payload
    return this.http.post(`${this.baseUrl}/orders`, {}, { headers })
      .pipe(
        // Add timeout to prevent hanging
        timeout(10000),
        // Add retry logic - retry up to 2 times with 1-second delay
        retry({
          count: 2,
          delay: 1000,
          resetOnSuccess: true
        }),
        catchError(error => {
          console.error('Error creating order:', error);
          
          // Provide more specific error messages based on error status
          if (error.status === 422) {
            return throwError(() => new Error('Order validation failed. Please check your cart and try again.'));
          } else if (error.status === 401 || error.status === 403) {
            return throwError(() => new Error('Authentication error. Please log in again.'));
          } else if (error.status === 0) {
            return throwError(() => new Error('Network error. Please check your connection and try again.'));
          }
          
          return throwError(() => error);
        })
      );
  }
}
