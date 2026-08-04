import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent],
  template: `
    <app-card>
      <h2>Login</h2>
      <form [formGroup]="form" class="form">
        <input formControlName="email" placeholder="Email" />
        <input formControlName="password" type="password" placeholder="Password" />
        <button type="button">Login</button>
      </form>
    </app-card>
  `
})
export class LoginComponent {
  readonly form = new FormBuilder().nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
}
