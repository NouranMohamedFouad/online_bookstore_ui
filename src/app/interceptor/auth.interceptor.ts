import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpRequestsService } from '../services/requests/http-requests.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const httpRequestsService = inject(HttpRequestsService);
  const token = httpRequestsService.getUserToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};