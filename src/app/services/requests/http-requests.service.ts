import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestsService {


  constructor(private http: HttpClient) { }

  getBooksList() : Observable<any>
  {
    return this.http.get('');
  }
  getOrdersList() : Observable<any>
  {
    return this.http.get('https://0832-167-99-134-26.ngrok-free.app/orders');
  }
}
