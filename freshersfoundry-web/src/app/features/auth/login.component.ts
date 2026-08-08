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
    <main class="login-page">
      <section class="login-card">
        <div class="brand-badge">F</div>
        <p class="eyebrow">Sign in</p>
        <h2>Access your FreshersFoundry account</h2>
        <p class="supporting-text">
          Use your account email and password to continue. Admin users will automatically see the Admin tab.
        </p>
        
        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <label>
            <span>Email</span>
            <input formControlName="email" type="email" placeholder="name@example.com" />
          </label>

          <label>
            <span>Password</span>
            <input formControlName="password" type="password" placeholder="Enter password" />
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
    </main>
  `,
  styles: [`
    .login-page {
      min-height: calc(100vh - 8rem);
      display: grid;
      place-items: center;
      padding: 1.25rem 0;
    }

    .login-card {
      width: min(100%, 460px);
      padding: 2rem;
      border: 1px solid var(--ff-border);
      border-radius: 1.5rem;
      background: linear-gradient(135deg, #ffffff, #f7fbff);
      box-shadow: var(--ff-shadow);
    }

    .brand-badge {
      width: 3rem;
      height: 3rem;
      border-radius: 1rem;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, var(--ff-cta), #7dd3fc);
      color: white;
      font-weight: 800;
      font-size: 1.2rem;
    }

    .eyebrow {
      margin: 0.95rem 0 0;
      color: var(--ff-cta);
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    h2 {
      margin: 0.45rem 0 0;
      font-size: 1.7rem;
      line-height: 1.2;
      color: var(--ff-text);
    }

    .supporting-text {
      margin: 0.75rem 0 0;
      color: var(--ff-muted);
      line-height: 1.65;
    }

    .auth-form {
      display: grid;
      gap: 0.95rem;
      margin-top: 1.2rem;
    }

    label {
      display: grid;
      gap: 0.4rem;
      font-size: 0.95rem;
      color: var(--ff-text);
      font-weight: 600;
    }

    input {
      width: 100%;
      padding: 0.9rem 1rem;
      border: 1px solid var(--ff-border);
      border-radius: 0.9rem;
      background: #f8fbff;
      color: var(--ff-text);
      outline: none;
    }

    input:focus {
      border-color: #7dd3fc;
      box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.2);
    }

    button {
      padding: 0.95rem 1rem;
      border: 0;
      border-radius: 0.95rem;
      background: linear-gradient(135deg, var(--ff-cta), #38bdf8);
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 12px 24px rgba(56, 189, 248, 0.2);
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.7;
      cursor: wait;
    }

    .error {
      margin: 0;
      color: var(--ff-danger);
      font-size: 0.95rem;
    }

    .helper-text {
      margin-top: 1rem;
      color: var(--ff-muted);
      text-align: center;
      font-size: 0.95rem;
    }

    .helper-text a {
      color: var(--ff-cta);
      font-weight: 700;
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
