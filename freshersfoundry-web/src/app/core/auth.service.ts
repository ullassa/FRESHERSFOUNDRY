import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

interface AuthUser {
  fullName: string;
  email: string;
  role: string;
}

interface AuthResponse {
  id: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
}

interface JwtPayload {
  role?: string;
  Role?: string;
  [key: string]: string | undefined;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly token = signal<string | null>(this.readStoredToken());
  readonly user = signal<AuthUser | null>(this.readStoredUser());

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password }).pipe(
      tap((response: AuthResponse) => this.applySession(response))
    );
  }

  setToken(value: string | null): void {
    this.token.set(value);
    if (value) {
      localStorage.setItem('ff_token', value);
    } else {
      localStorage.removeItem('ff_token');
    }
  }

  getToken(): string | null {
    return this.token();
  }

  isAuthenticated(): boolean {
    return Boolean(this.token());
  }

  isAdmin(): boolean {
    return this.user()?.role === 'Admin' || this.getRoleFromToken(this.token()) === 'Admin';
  }

  logout(): void {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
  }

  private applySession(response: AuthResponse): void {
    this.token.set(response.token);
    this.user.set({ fullName: response.fullName, email: response.email, role: response.role });
    localStorage.setItem('ff_token', response.token);
    localStorage.setItem('ff_user', JSON.stringify({ fullName: response.fullName, email: response.email, role: response.role }));
  }

  private readStoredToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem('ff_token');
  }

  private readStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const rawUser = localStorage.getItem('ff_user');
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      return null;
    }
  }

  private getRoleFromToken(token: string | null): string | null {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as JwtPayload;
      return payload.role ?? payload.Role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? null;
    } catch {
      return null;
    }
  }

  private base64UrlDecode(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return atob(padded);
  }
}
