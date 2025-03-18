import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CryptoHelper } from '../../helper/crypto-helper';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestsService {
  private baseUrl = 'api.testdomainnamefortestingmydevtesting.mom';

  constructor(private http: HttpClient) { }

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
      console.log(userData);
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
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }
}
