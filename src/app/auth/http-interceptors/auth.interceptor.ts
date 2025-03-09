import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private loginService: LoginService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Skip authentication for login and public endpoints
    if (
      request.url.includes('/auth/login') ||
      request.url.includes('/auth/signup') ||
      (request.url.includes('/books') && request.method === 'GET')
    ) {
      return next.handle(request);
    }

    // Add authorization header to all other requests
    const token = this.loginService.getToken();
    if (token) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next.handle(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle 401 Unauthorized errors
          if (error.status === 401) {
            // Token is invalid or expired
            this.loginService.logout();
            this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    }

    // No token available, proceed without authentication
    return next.handle(request);
  }
}
