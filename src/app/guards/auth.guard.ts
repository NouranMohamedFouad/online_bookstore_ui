import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../auth/login/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  if (loginService.isAuthenticated() && loginService.hasRole('admin')) {
    return true;
  }

  // If user is authenticated but not admin, redirect to home
  if (loginService.isAuthenticated()) {
    router.navigate(['/']);
    return false;
  }

  // If user is not authenticated, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
