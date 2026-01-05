import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const userManagementGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Permitir acceso si es admin o si tiene el rol ENTERPRISE_ADMIN
  if (authService.isAdmin() || authService.hasRole('ENTERPRISE_ADMIN')) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};

