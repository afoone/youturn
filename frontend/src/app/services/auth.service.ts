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
    return !!this.getToken();
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
        // Verificar que el token sigue siendo válido
        this.getCurrentUser().subscribe({
          next: (currentUser) => {
            this.currentUserSubject.next(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          },
          error: () => {
            this.logout();
          }
        });
      } catch (error) {
        this.logout();
      }
    }
  }
}

