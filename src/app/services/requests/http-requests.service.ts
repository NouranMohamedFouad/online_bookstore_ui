import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CryptoHelper } from '../../helper/crypto-helper';


@Injectable({
  providedIn: 'root'
})
export class HttpRequestsService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // getBooksList(page: number, pageSize: number): Observable<any> {
  //   let params = new HttpParams().set('page', page).set('pageSize', pageSize);
  //   return this.http.get(`${this.baseUrl}/books`, { params });
  // }

  getOrdersList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders`);
  }

  addBook(bookData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/books`, bookData);
  }
  signup(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, userData);
  }
  deleteAccount(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`);
  }

  getUserData() {
    const userData = CryptoHelper.decrypt(localStorage.getItem('userData') || '');
    if (userData) {
      return JSON.parse(userData);
    }
    return {
      name: '',
      email: '',
      phone: '',
      role: '',
      address: {
        street: '',
        city: '',
        buildingNo: '',
        floorNo: '',
        flatNo: ''
      }
    };
  }
  getUserToken() {
    const userToken = CryptoHelper.decrypt(localStorage.getItem('token') || '');
    return userToken;
  }
  updateUserData(id: number, userData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}`, userData);
  }
}
