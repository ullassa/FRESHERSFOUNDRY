import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent],
  template: `
    <app-card>
      <h2>Register</h2>
      <form [formGroup]="form" class="form">
        <input formControlName="fullName" placeholder="Full name" />
        <input formControlName="email" placeholder="Email" />
        <input formControlName="password" type="password" placeholder="Password" />
        <button type="button">Create account</button>
      </form>
    </app-card>
  `
})
export class RegisterComponent {
  readonly form = new FormBuilder().nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
}
