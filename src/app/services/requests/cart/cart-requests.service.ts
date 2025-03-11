import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError, forkJoin, map, of, switchMap, timeout } from 'rxjs';
import { Cart, CartItem } from '../../../interfaces/cart';
import { LoginService } from '../../../auth/login/login.service';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartRequestsService {
  private baseUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) { }

  // Get user ID from token for requests
  private getUserIdFromToken(): string | null {
    const token = this.loginService.getToken();
    if (!token) {
      console.error('No token available');
      return null;
    }

    try {
      // Decode JWT token to extract user ID
      const decoded = jwtDecode<JwtPayload>(token);
      console.log('Decoded token payload:', { id: decoded.id, exp: new Date(decoded.exp * 1000) });
      return decoded.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Handle API errors
  private handleError(error: HttpErrorResponse) {
    console.error('Cart API error:', error);
    
    if (error.status === 0) {
      // A client-side or network error occurred
      console.error('A network error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code
      console.error(
        `Backend returned code ${error.status}, body was:`,
        error.error
      );
    }
    
    // Return the error for the component to handle
    return throwError(() => error);
  }

  // Get the current user's cart
  getCart(): Observable<Cart> {
    console.log('Getting cart from API');
    const userId = this.getUserIdFromToken();
    console.log('User ID from token:', userId);
    
    return this.http.get<Cart>(`${this.baseUrl}/cart`).pipe(
      tap(cart => {
        console.log('Cart received with populated book details:', cart);
        // Enrich the cart with user ID if needed
        if (cart && !cart.userId && userId) {
          cart.userId = userId;
        }
      }),
      catchError(this.handleError)
    );
  }

  // Add an item to cart
  addToCart(bookId: string): Observable<Cart> {
    console.log(`Adding book ${bookId} to cart`);
    const userId = this.getUserIdFromToken();
    console.log('User ID from token:', userId);
    
    return this.http.post<Cart>(`${this.baseUrl}/cart`, { bookId })
      .pipe(catchError(this.handleError));
  }

  // Update item quantity in cart
  updateQuantity(bookId: string, quantity: number): Observable<Cart> {
    console.log(`Updating quantity for book ${bookId} to ${quantity}`);
    const userId = this.getUserIdFromToken();
    console.log('User ID from token:', userId);
    
    return this.http.patch<Cart>(`${this.baseUrl}/cart`, { bookId, quantity })
      .pipe(catchError(this.handleError));
  }

  // Remove an item from cart
  removeFromCart(bookId: string): Observable<any> {
    console.log(`Removing book ${bookId} from cart`);
    const userId = this.getUserIdFromToken();
    console.log('User ID from token:', userId);
    
    return this.http.delete<any>(`${this.baseUrl}/cart/${bookId}`)
      .pipe(catchError(this.handleError));
  }
} 