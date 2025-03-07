import { HttpClient ,HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestsService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getBooksList(page: number, pageSize: number): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get(`${this.baseUrl}/books`, { params });
  }

  getOrdersList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders`);
  }

  addBook(bookData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/books`, bookData);
  }
}