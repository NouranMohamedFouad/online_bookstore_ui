import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../../auth/login/login.service';
import { inject } from '@angular/core';

export const isLogedinGuard: CanActivateFn = (route, state) => {
  const httpRequestsService = inject(LoginService);
   const router = inject(Router);
 
   const userData = httpRequestsService.isAuthenticated();
   if (!userData) {    
     router.navigate(['/notfound']);
     return false;
   }
   return true;
};
