import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-panel">
        <div class="brand-box">
          <div class="brand-mark">F</div>
          <div>
            <div class="brand-title">FreshersFoundry</div>
            <div class="brand-subtitle">Career platform for freshers</div>
          </div>
        </div>

        <div class="panel-copy">
          <p class="eyebrow">Welcome back</p>
          <h2>Sign in to continue</h2>
          <p class="supporting-text">
            Access your saved jobs, interview stories, and community content.
          </p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <label>
            <span>Email</span>
            <input formControlName="email" type="email" placeholder="name@example.com" />
          </label>

          <label>
            <span>Password</span>
            <input formControlName="password" type="password" placeholder="Enter your password" />
          </label>

          <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <button type="submit" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="helper-text">
          Need an account?
          <a routerLink="/auth/register">Create one</a>
        </p>
      </section>

      <aside class="promo-panel">
        <div class="promo-content">
          <p class="promo-tag">Why FreshersFoundry?</p>
          <h3>Explore opportunities, stories, and prep resources built for your next step.</h3>
          <ul>
            <li>Curated freshers job listings</li>
            <li>Real interview experiences</li>
            <li>Practice questions by skill</li>
            <li>Career blogs and guidance</li>
          </ul>
        </div>
      </aside>
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }

    .auth-shell {
      min-height: calc(100vh - 8rem);
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 2rem;
      align-items: center;
      padding: 2rem 1rem 3rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .auth-panel,
    .promo-panel {
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 28px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
    }

    .auth-panel {
      padding: 2.25rem;
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .brand-mark {
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      border-radius: 18px;
      background: linear-gradient(135deg, #4f46e5, #38bdf8);
      color: #fff;
      font-weight: 800;
      box-shadow: 0 12px 24px rgba(79, 70, 229, 0.3);
    }

    .brand-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
    }

    .brand-subtitle {
      font-size: 0.76rem;
      color: #64748b;
    }

    .eyebrow {
      margin: 0;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.72rem;
      font-weight: 800;
    }

    h2 {
      margin: 0.6rem 0 0;
      font-size: clamp(2rem, 3vw, 2.6rem);
      line-height: 1.15;
      color: #0f172a;
    }

    .supporting-text {
      margin: 0.8rem 0 0;
      color: #475569;
      line-height: 1.7;
      font-size: 0.96rem;
    }

    .auth-form {
      display: grid;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    label {
      display: grid;
      gap: 0.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
    }

    input {
      width: 100%;
      padding: 0.92rem 1rem;
      border: 1px solid #dfe7f1;
      border-radius: 14px;
      background: #f8fafc;
      color: #0f172a;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    input:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15);
    }

    button {
      border: none;
      border-radius: 14px;
      padding: 1rem 1.2rem;
      background: linear-gradient(135deg, #4f46e5, #0ea5e9);
      color: white;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 18px 30px rgba(79, 70, 229, 0.18);
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.75;
      cursor: wait;
    }

    .error {
      margin: 0;
      color: #dc2626;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .helper-text {
      margin-top: 1.2rem;
      text-align: center;
      color: #475569;
      font-size: 0.95rem;
    }

    .helper-text a {
      color: #4f46e5;
      font-weight: 700;
      text-decoration: none;
    }

    .promo-panel {
      min-height: 540px;
      background: linear-gradient(160deg, #111827 0%, #1d4ed8 46%, #38bdf8 100%);
      color: white;
      padding: 2rem;
      display: flex;
      align-items: end;
      overflow: hidden;
      position: relative;
    }

    .promo-panel::before {
      content: '';
      position: absolute;
      inset: -30% auto auto -10%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      filter: blur(20px);
    }

    .promo-content {
      position: relative;
      z-index: 1;
      max-width: 420px;
    }

    .promo-tag {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.7rem;
      opacity: 0.8;
    }

    h3 {
      margin: 0.8rem 0 1.2rem;
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      line-height: 1.2;
      color: white;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 0.8rem;
      color: rgba(255, 255, 255, 0.9);
      font-size: 1rem;
    }

    li {
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }

    li::before {
      content: '✓';
      width: 1.5rem;
      height: 1.5rem;
      display: grid;
      place-items: center;
      background: rgba(255,255,255,0.14);
      border-radius: 999px;
      font-weight: 800;
    }

    @media (max-width: 900px) {
      .auth-shell {
        grid-template-columns: 1fr;
      }

      .promo-panel {
        min-height: 260px;
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();
    this.authService.login(email, password).subscribe({
      next: (response) => this.router.navigateByUrl(response.role === 'Admin' ? '/admin' : '/'),
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage.set(error?.error?.message ?? 'Unable to sign in right now.');
        this.isSubmitting.set(false);
      }
    });
  }
}
