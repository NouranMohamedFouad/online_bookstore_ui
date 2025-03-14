import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { User, AuthResponse, LoginRequest } from '../../interfaces/user';
import { Router } from '@angular/router';
import { CryptoHelper } from '../../helper/crypto-helper';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private baseUrl = 'https://4fb48a73561160ae9baeeba2bb5a7a82.serveo.net';
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
      const expiresAt = CryptoHelper.decrypt(localStorage.getItem('tokenExpires') || '');
      const token = CryptoHelper.decrypt(localStorage.getItem('token') || '');

      if (!token || !expiresAt) {
        console.warn('No token or expiration found in localStorage');
        return null;
      }

      const expirationDate = new Date(expiresAt);
      const now = new Date();
      
      // Add a 5-minute grace period for token expiration
      // This helps prevent logout during active user sessions
      const gracePeriodMs = 5 * 60 * 1000; // 5 minutes
      const effectiveExpirationDate = new Date(expirationDate.getTime() + gracePeriodMs);

      // Add logging to help debug token expiration issues
      console.log('Token expiration check:', {
        expirationTimestamp: expirationDate.getTime(),
        nowTimestamp: now.getTime(),
        expiresIn: Math.floor((expirationDate.getTime() - now.getTime()) / 1000) + ' seconds',
        isExpired: expirationDate < now,
        effectiveExpirationWithGrace: effectiveExpirationDate.toISOString(),
        isExpiredWithGrace: effectiveExpirationDate < now
      });

      // Only consider token expired after the grace period 
      if (effectiveExpirationDate < now) {
        // Token has expired
        console.warn('Token has expired (including grace period), clearing user data');
        this.clearUserData();
        return null;
      }

      // If token is getting close to expiration, try to refresh it
      const tokenRefreshThresholdMs = 30 * 60 * 1000; // 30 minutes
      if (expirationDate.getTime() - now.getTime() < tokenRefreshThresholdMs) {
        console.log('Token is close to expiration, should refresh it soon');
        // Note: We're not implementing actual refresh logic here, just logging
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
    const userData = CryptoHelper.decrypt(localStorage.getItem('userData') || '');
    const token = CryptoHelper.decrypt(localStorage.getItem('token') || '');
    const tokenExpires = CryptoHelper.decrypt(localStorage.getItem('tokenExpires') || '');

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
    // localStorage.setItem('userData', JSON.stringify(user));
    // localStorage.setItem('token', token);
    // localStorage.setItem('tokenExpires', expirationDate.toISOString());
    localStorage.setItem('userData', CryptoHelper.encrypt(JSON.stringify(user)));
    localStorage.setItem('token', CryptoHelper.encrypt(token));
    localStorage.setItem('tokenExpires', CryptoHelper.encrypt(expirationDate.toISOString()));

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
