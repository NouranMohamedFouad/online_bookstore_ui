// 
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BooksRequestsService {
  private baseUrl = 'https://4fb48a73561160ae9baeeba2bb5a7a82.serveo.net';

  constructor(private http: HttpClient) { }

  getBooksList(page: number, pageSize: number, title?: string): Observable<any> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
      if (title) {
        params = new HttpParams().set('pageSize', pageSize).set('title',title);
      }
      console.log(params);
      
    return this.http.get(`${this.baseUrl}/books`, { params });
  }

  getBookById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/books/${id}`);
  }

  addBook(bookData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/books`, bookData);
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/books/${id}`);
  }

  updateBook(id: number, bookData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/books/${id}`, bookData);
  }

  deleteAllBooks(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/books`);
  }
}