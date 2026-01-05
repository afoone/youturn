import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3100/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario del localStorage al iniciar
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.setAuthData(response);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.setAuthData(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    // Verificar que existe el token y no está expirado
    return this.isTokenValid();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.admin === true;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.roles) return false;
    return roles.some(role => user.roles.includes(role));
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);

        // Verificar primero si el token está expirado localmente antes de hacer la petición HTTP
        if (!this.isTokenValid()) {
          this.logout();
          return;
        }

        // Solo verificar con el servidor si el token no está expirado localmente
        // Si el servidor no está disponible, no hacemos logout para evitar perder la sesión
        this.getCurrentUser().subscribe({
          next: (currentUser) => {
            this.currentUserSubject.next(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          },
          error: (error) => {
            // Solo hacer logout si el error es 401 (Unauthorized) o 403 (Forbidden)
            // Esto indica que el token es inválido en el servidor
            // Otros errores (500, network, etc.) no deberían invalidar el token
            if (error?.status === 401 || error?.status === 403) {
              this.logout();
            }
            // Error del servidor o red, pero el token puede ser válido
            // No hacemos logout, el usuario puede seguir usando la app
          }
        });
      } catch (error) {
        this.logout();
      }
    }
  }

  /**
   * Verifica si el token existe y no está expirado
   * Decodifica el JWT para verificar la expiración sin hacer una llamada HTTP
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      // Decodificar el JWT (sin verificar la firma, solo para ver la expiración)
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      // Verificar si el token ha expirado
      if (payload.exp && payload.exp < currentTime) {
        // Token expirado, limpiar
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      // Si hay error al decodificar, asumir que es inválido
      return false;
    }
  }
}

