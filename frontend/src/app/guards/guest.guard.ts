import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que redirige a usuarios autenticados lejos de rutas públicas (como login/register)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si hay token válido
  if (authService.isAuthenticated()) {
    // Si ya está autenticado, redirigir a la página principal
    router.navigate(['/ticket-points']);
    return false;
  }

  return true;
};

