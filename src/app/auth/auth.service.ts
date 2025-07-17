import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface LoginResponse {
  token: string;
  role: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'jwt_token';
  private roleKey = 'user_role';
  private usernameKey = 'username';
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private refreshTokenKey = 'refresh_token';

  constructor(private http: HttpClient, private router: Router) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>('/auth/login', { email: username, password }, { headers }).pipe(
      tap(res => {
        this.setSession(res);
        this.loggedIn$.next(true);
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.usernameKey);
    }
    this.loggedIn$.next(false);
    this.router.navigate(['/login']);
  }

  private setSession(authResult: LoginResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, authResult.token);
      localStorage.setItem(this.roleKey, authResult.role);
      localStorage.setItem(this.usernameKey, authResult.username);
      if ((authResult as any).refreshToken) {
        this.setRefreshToken((authResult as any).refreshToken);
      }
    }
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.roleKey);
  }

  getUsername(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.usernameKey);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  hasToken(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem(this.tokenKey);
  }

  register(user: any): Observable<any> {
    return this.http.post('/auth/register', user);
  }

  setRefreshToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.refreshTokenKey);
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.http.post<LoginResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(res => {
        this.setSession(res);
      })
    );
  }
} 