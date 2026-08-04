import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(null);

  setToken(value: string | null): void {
    this.token.set(value);
  }

  getToken(): string | null {
    return this.token();
  }
}
