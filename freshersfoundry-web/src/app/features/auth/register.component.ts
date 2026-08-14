import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card">
        <div class="title-block">
          <h2>Create your account</h2>
          <p>Set up your profile and start exploring opportunities designed for freshers.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
          <label>
            <span>Full name</span>
            <input formControlName="fullName" type="text" placeholder="Full name" />
          </label>

          <label>
            <span>Email</span>
            <input formControlName="email" type="email" placeholder="Email" />
          </label>

          <label>
            <span>Password</span>
            <input formControlName="password" type="password" placeholder="Password" />
          </label>

          <p class="error" *ngIf="errorMessage()">{{ errorMessage() }}</p>

          <button type="submit" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Creating account...' : 'Create account' }}
          </button>
        </form>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }

    .auth-shell {
      min-height: calc(100vh - 8rem);
      display: grid;
      place-items: center;
      padding: 2rem 1rem 3rem;
    }

    .auth-card {
      width: min(100%, 460px);
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 24px;
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
      padding: 2rem;
    }

    .title-block {
      margin-bottom: 1.5rem;
    }

    h2 {
      margin: 0;
      font-size: clamp(2rem, 3vw, 2.5rem);
      line-height: 1.15;
      color: #0f172a;
    }

    p {
      margin: 0.8rem 0 0;
      color: #475569;
      line-height: 1.7;
      font-size: 0.97rem;
    }

    .auth-form {
      display: grid;
      gap: 1rem;
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
      padding: 0.9rem 1rem;
      border: 1px solid #dfe7f1;
      border-radius: 12px;
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
      border-radius: 12px;
      padding: 0.95rem 1.2rem;
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
  `]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
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

    const { fullName, email, password } = this.form.getRawValue();
    this.authService.register(fullName, email, password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage.set(error?.error?.message ?? 'Unable to create your account right now.');
        this.isSubmitting.set(false);
      }
    });
  }
}
