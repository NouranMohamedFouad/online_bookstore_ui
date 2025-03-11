import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../auth/login/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  
  console.log(`AuthGuard: Checking authentication for ${state.url}`);
  
  if (loginService.isAuthenticated()) {
    console.log('AuthGuard: User is authenticated, allowing access');
    return true;
  }

  console.warn('AuthGuard: User is not authenticated, redirecting to login');
  // Redirect to login page with return URL
  router.navigate(['/login'], { 
    queryParams: { 
      returnUrl: state.url,
      errorMsg: 'Please log in to access this page'
    } 
  });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  
  console.log(`AdminGuard: Checking admin access for ${state.url}`);

  if (loginService.isAuthenticated() && loginService.hasRole('admin')) {
    console.log('AdminGuard: User is admin, allowing access');
    return true;
  }

  // If user is authenticated but not admin, redirect to home
  if (loginService.isAuthenticated()) {
    console.warn('AdminGuard: User is authenticated but not admin, redirecting to home');
    router.navigate(['/']);
    return false;
  }

  // If user is not authenticated, redirect to login
  console.warn('AdminGuard: User is not authenticated, redirecting to login');
  router.navigate(['/login'], { 
    queryParams: { 
      returnUrl: state.url,
      errorMsg: 'You need admin access for this page'
    } 
  });
  return false;
};
