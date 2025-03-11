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
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, {
        email: loginData.email,
        password: loginData.password,
      })
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
    // Call the backend logout endpoint
    this.http.get(`${this.baseUrl}/auth/logout`).subscribe({
      next: () => {
        this.clearUserData();
      },
      error: () => {
        // Even if the server-side logout fails, clear the local data
        this.clearUserData();
      },
    });
  }

  /**
   * Clear local user data and redirect to login
   */
  private clearUserData(): void {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpires');

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
    return !!this.userSubject.value && !!this.getToken();
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
    try {
      // Check if token has expired
      const expiresAt = localStorage.getItem('tokenExpires');
      const token = localStorage.getItem('token');
      
      if (!token || !expiresAt) {
        console.warn('No token or expiration found in localStorage');
        return null;
      }
      
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      
      // Add logging to help debug token expiration issues
      console.log('Token expiration check:', {
        expirationTimestamp: expirationDate.getTime(),
        nowTimestamp: now.getTime(),
        expiresIn: Math.floor((expirationDate.getTime() - now.getTime()) / 1000) + ' seconds',
        isExpired: expirationDate < now
      });
      
      if (expirationDate < now) {
        // Token has expired
        console.warn('Token has expired, clearing user data');
        this.clearUserData();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      // Clear data if there's an error to be safe
      this.clearUserData();
      return null;
    }
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
      this.clearUserData();
    }, expirationDuration);
  }

  /**
   * Load user data from localStorage on app initialization
   */
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    const tokenExpires = localStorage.getItem('tokenExpires');

    if (!userData || !token || !tokenExpires) {
      return;
    }

    try {
      // Check if token is expired
      if (new Date(tokenExpires) < new Date()) {
        this.clearUserData();
        return;
      }

      const user: User = JSON.parse(userData);
      this.userSubject.next(user);

      // Set up auto logout timer
      const expirationDuration =
        new Date(tokenExpires).getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      this.clearUserData();
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthentication(
    response: AuthResponse,
    rememberMe?: boolean
  ): void {
    const { token, data } = response as any; // Handle the actual backend response format
    const user = data.user; // The backend response structure is { token, data: { user } }

    // Calculate token expiration
    // Default to 24 hours if not specified in the token
    const expiresInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const expirationDate = new Date(new Date().getTime() + expiresInMs);

    // Store user data and token
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpires', expirationDate.toISOString());

    console.log('Authentication successful, token stored', {
      user: user.name,
      token: token.substring(0, 10) + '...',
      expires: expirationDate
    });

    // Update the user subject
    this.userSubject.next(user);

    // Set up auto-logout based on token expiration
    this.autoLogout(expiresInMs);
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
        errorMessage = 'Incorrect email or password';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
