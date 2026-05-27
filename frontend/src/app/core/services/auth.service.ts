import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUser = signal<AuthResponse | null>(null);

  isAuthenticated = computed(() => !!this.currentUser()?.token);
  user = computed(() => this.currentUser());
  userRole = computed(() => this.currentUser()?.role);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
    this.handleOAuthCallback();
  }

  /**
   * Handle OAuth2 callback - captures token from URL after Google redirect
   */
  private handleOAuthCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Fetch user info with the token
      this.http.get<AuthResponse>(`${this.apiUrl}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (userInfo) => {
          const authResponse: AuthResponse = {
            ...userInfo,
            token: token
          };
          this.setCurrentUser(authResponse);

          // Clean URL and redirect
          window.history.replaceState({}, document.title, window.location.pathname);
          this.redirectToDashboard();
        },
        error: () => {
          // If /me fails, try to decode token and create minimal user
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const authResponse: AuthResponse = {
              token: token,
              id: payload.id || 0,
              email: payload.sub || payload.email || '',
              nom: payload.nom || '',
              prenom: payload.prenom || '',
              role: payload.role || 'PATIENT'
            };
            this.setCurrentUser(authResponse);
            window.history.replaceState({}, document.title, window.location.pathname);
            this.redirectToDashboard();
          } catch {
            console.error('Failed to process OAuth token');
          }
        }
      });
    }
  }

  private loadStoredUser(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser.set(JSON.parse(stored));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (!response.requiresTwoFactor) {
          this.setCurrentUser(response);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.setCurrentUser(response))
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setCurrentUser(user: AuthResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUser.set(user);
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  hasRole(roles: Role[]): boolean {
    const userRole = this.currentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  redirectToDashboard(): void {
    const role = this.currentUser()?.role;
    switch (role) {
      case 'PATIENT':
        this.router.navigate(['/patient']);
        break;
      case 'MEDECIN':
        this.router.navigate(['/medecin']);
        break;
      case 'SECRETAIRE':
        this.router.navigate(['/secretaire']);
        break;
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
