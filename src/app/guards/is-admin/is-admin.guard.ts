import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpRequestsService } from '../../services/requests/http-requests.service';

export const isAdminGuard: CanActivateFn = (route, state) => {
  const httpRequestsService = inject(HttpRequestsService);
  const router = inject(Router);

  const userData = httpRequestsService.getUserData();
  if (userData && userData.role !== 'admin') {
    router.navigate(['/notfound']);
    return false;
  }
  return true;
};