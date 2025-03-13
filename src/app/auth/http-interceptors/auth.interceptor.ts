import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private loginService: LoginService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Skip authentication for login, register, and public endpoints
    if (
      request.url.includes('/auth/login') ||
      request.url.includes('/auth/signup') ||
      (request.url.includes('/books') && request.method === 'GET') ||
      request.url.includes('/paymob/') // Skip auth for Paymob API calls
    ) {
      console.log('Skipping auth for public endpoint:', request.url);
      return next.handle(request);
    }

    // Add authorization header to all other requests
    const token = this.loginService.getToken();
    console.log('Auth interceptor processing request to:', request.url);
    console.log('Token available:', token ? 'Yes' : 'No');

    if (token) {
      try {
        // Verify token is valid by attempting to decode it
        const decoded = jwtDecode<JwtPayload>(token);
        const userId = decoded.id;
        const expiryDate = new Date(decoded.exp * 1000);
        const isExpired = expiryDate < new Date();
        // Add a 5-minute buffer to prevent issues near expiration
        const isNearExpiry = expiryDate.getTime() - new Date().getTime() < 5 * 60 * 1000;

        console.log('Token details:', {
          userId,
          expiryDate: expiryDate.toISOString(),
          isExpired,
          isNearExpiry,
          url: request.url
        });

        // Allow payment-related requests to proceed even if token is near expiry
        const isPaymentRequest = 
          request.url.includes('/payment') || 
          request.url.includes('/cart');

        if (isExpired && !isPaymentRequest) {
          console.warn('Token is expired, logging out');
          // Don't immediately log out, just handle the error that will come back
          const authRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(authRequest).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 401) {
                this.loginService.logout();
                this.router.navigate(['/login']);
              }
              return throwError(() => error);
            })
          );
        }

        // Clone the request and add the authorization header
        const authRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Added auth header to request:', request.url);

        return next.handle(authRequest).pipe(
          tap(event => {
            console.log('Response from API for', request.url, typeof event);
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('API error:', request.url, error);

            // For payment requests, be more forgiving with auth errors
            if (isPaymentRequest && error.status === 401) {
              console.log('Auth error in payment flow - redirecting to login');
              
              // Store the cart in session storage to retrieve after login
              if (this.router.url.includes('/payment')) {
                try {
                  sessionStorage.setItem('pendingPayment', 'true');
                } catch (err) {
                  console.error('Error saving pending payment state:', err);
                }
              }
              
              this.router.navigate(['/login'], {
                queryParams: {
                  returnUrl: this.router.url
                }
              });
              
              return throwError(() => new Error('Authentication required for payment'));
            }

            // Handle 401 Unauthorized errors
            if (error.status === 401) {
              console.log('401 Unauthorized error - logging out');
              // Token is invalid or expired
              this.loginService.logout();
              this.router.navigate(['/login'], {
                queryParams: {
                  returnUrl: this.router.url,
                  errorMsg: 'Your session has expired. Please log in again.'
                }
              });
            }

            // Handle 403 Forbidden errors
            if (error.status === 403) {
              console.log('403 Forbidden error - insufficient permissions');
              this.router.navigate(['/'], {
                queryParams: {
                  errorMsg: 'You don\'t have permission to access this resource'
                }
              });
            }

            return throwError(() => error);
          })
        );
      } catch (error) {
        console.error('Token decode error:', error);
        // Don't log out immediately for payment requests
        if (request.url.includes('/payment') || request.url.includes('/cart')) {
          console.log('Token error during payment flow - proceeding to login');
          this.router.navigate(['/login'], {
            queryParams: {
              returnUrl: request.url
            }
          });
          return throwError(() => new Error('Authentication required'));
        }
        
        this.loginService.logout();
        this.router.navigate(['/login'], {
          queryParams: {
            returnUrl: this.router.url,
            errorMsg: 'Authentication error. Please log in again.'
          }
        });
        return throwError(() => new Error('Invalid token format'));
      }
    }

    // No token available, proceed without authentication for some endpoints
    console.warn('No token available for authenticated endpoint:', request.url);
    
    // For payment or cart requests, redirect to login
    if (request.url.includes('/payment') || request.url.includes('/cart')) {
      console.error('Payment/cart request without authentication - redirecting to login');
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url,
          errorMsg: 'Please log in to continue with payment'
        }
      });
      return throwError(() => new Error('Authentication required'));
    }

    return next.handle(request);
  }
}
