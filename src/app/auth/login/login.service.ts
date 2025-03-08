import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest } from '../../interfaces/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private baseUrl = 'http://localhost:3000';
  private userSubject = new BehaviorSubject<User | null>(null);

  // Observable stream of the authenticated user
  public currentUser$ = this.userSubject.asObservable();

  // Token expiration timer
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    // Load user from localStorage on service initialization
    this.loadUserFromStorage();
  }

  /**
   * Authenticate user with email and password
   */
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, loginData)
      .pipe(
        tap((response) =>
          this.handleAuthentication(response, loginData.rememberMe)
        ),
        catchError(this.handleError)
      );
  }

  /**
   * End user session and clean up stored data
   */
  logout(): void {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = null;
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Determine if a user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    return this.userSubject.value?.role === role;
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get user ID of the logged-in user
   */
  getUserId(): string | undefined {
    return this.userSubject.value?._id;
  }

  /**
   * Set up automatic logout when token expires
   */
  private autoLogout(expirationDuration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  /**
   * Load user data from localStorage on app initialization
   */
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      return;
    }

    try {
      const user: User = JSON.parse(userData);
      this.userSubject.next(user);

      // Check token expiration from JWT if needed
      // For now we'll assume the token is valid
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      this.logout();
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthentication(
    response: AuthResponse,
    rememberMe?: boolean
  ): void {
    const { user, token } = response;

    // Store user data and token
    if (rememberMe) {
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      // For session-only storage, you could use sessionStorage instead
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('token', token);
    }

    // Update the user subject
    this.userSubject.next(user);

    // Set up auto-logout if needed (would need token expiration time)
    // Assuming token is valid for 1 hour:
    // this.autoLogout(3600 * 1000);
  }

  /**
   * Handle HTTP errors during authentication
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
