import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <span class="brand-mark">F</span>
          <div>
            <div class="brand-title">FreshersFoundry</div>
            <div class="brand-subtitle">Verified interview stories, jobs, and prep</div>
          </div>
        </div>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
          <a routerLink="/jobs" routerLinkActive="active">Jobs</a>
          <a routerLink="/blogs" routerLinkActive="active">Blogs</a>
          <a routerLink="/interview-experiences" routerLinkActive="active">Experiences</a>
          <a routerLink="/interview-questions" routerLinkActive="active">Questions</a>
          <a *ngIf="auth.isAuthenticated() && auth.isAdmin()" routerLink="/admin" routerLinkActive="active">Admin</a>
          <a *ngIf="!auth.isAuthenticated()" routerLink="/auth/login" routerLinkActive="active">Login</a>
          <a *ngIf="!auth.isAuthenticated()" routerLink="/auth/register" routerLinkActive="active">Register</a>
          <button *ngIf="auth.isAuthenticated()" type="button" class="logout-btn" (click)="logout()">Logout</button>
        </nav>
      </header>

      <main class="page-shell">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell {
      min-height: 100vh;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      gap: 1.5rem;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: rgba(15, 23, 42, 0.96);
      color: #fff;
      box-shadow: 0 8px 30px rgba(15, 23, 42, 0.16);
      backdrop-filter: blur(16px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    .brand-mark {
      display: grid;
      place-items: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.9rem;
      background: linear-gradient(135deg, #38bdf8, #0f172a);
      font-weight: 800;
    }

    .brand-title {
      font-size: 1rem;
      font-weight: 800;
    }

    .brand-subtitle {
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.72);
    }

    .nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      align-items: center;
    }

    .nav a,
    .logout-btn {
      padding: 0.65rem 0.95rem;
      border-radius: 999px;
      color: rgba(255, 255, 255, 0.82);
      transition: background 0.2s ease, color 0.2s ease;
      border: 0;
      background: transparent;
      cursor: pointer;
      font: inherit;
    }

    .nav a.active,
    .nav a:hover,
    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .page-shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    @media (max-width: 900px) {
      .topbar {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-shell {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
