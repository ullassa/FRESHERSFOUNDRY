import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  selector: 'app-apply-creator',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent],
  template: `
    <app-card>
      <h2>Apply to Become a Creator</h2>
      <form [formGroup]="form" class="form">
        <textarea formControlName="reason" rows="5" placeholder="Tell us why you want to create content"></textarea>
        <button type="button">Submit application</button>
      </form>
    </app-card>
  `
})
export class ApplyCreatorComponent {
  readonly form = new FormBuilder().nonNullable.group({
    reason: ['', [Validators.required, Validators.minLength(20)]]
  });
}
