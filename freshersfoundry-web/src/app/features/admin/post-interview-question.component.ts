import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CardComponent } from '../../shared/components/card.component';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-interview-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <app-card>
      <div class="page-head">
        <p class="eyebrow">Admin publishing</p>
        <h2>Post Interview Question</h2>
        <p class="supporting-text">Use clear, spaced fields so questions and answers remain readable.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
        <div class="two-column">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <input matInput formControlName="category" />
            <mat-error *ngIf="form.get('category')?.hasError('required')">Category is required.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sub-topic</mat-label>
            <input matInput formControlName="subTopic" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Difficulty</mat-label>
          <mat-select formControlName="difficulty">
            <mat-option value="Easy">Easy</mat-option>
            <mat-option value="Medium">Medium</mat-option>
            <mat-option value="Hard">Hard</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('difficulty')?.hasError('required')">Difficulty is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Question</mat-label>
          <textarea matInput formControlName="question" rows="4"></textarea>
          <mat-error *ngIf="form.get('question')?.hasError('required')">Question is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Answer</mat-label>
          <textarea matInput formControlName="answer" rows="4"></textarea>
          <mat-error *ngIf="form.get('answer')?.hasError('required')">Answer is required.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Code snippet</mat-label>
          <textarea matInput formControlName="codeSnippet" rows="4"></textarea>
        </mat-form-field>

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Posting…' : 'Post Question' }}
          </button>
          <button mat-button type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </app-card>
  `
})
export class PostInterviewQuestionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    category: ['', [Validators.required]],
    subTopic: [''],
    difficulty: ['Medium', [Validators.required]],
    question: ['', [Validators.required]],
    answer: ['', [Validators.required]],
    codeSnippet: ['']
  });

  readonly isSubmitting = signal(false);
  readonly editingId = signal<string | null>(null);

  get category() {
    return this.form.get('category');
  }

  get difficulty() {
    return this.form.get('difficulty');
  }

  get question() {
    return this.form.get('question');
  }

  get answer() {
    return this.form.get('answer');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId.set(id);
      this.http.get(`${environment.apiBaseUrl}/interview-questions/${id}`).subscribe({
        next: (res: any) => {
          this.form.patchValue({
            category: res.category,
            subTopic: res.subTopic,
            difficulty: res.difficultyLevel ?? res.difficulty,
            question: res.question,
            answer: res.answer,
            codeSnippet: res.codeSnippet
          });
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token = this.auth.getToken();
    if (!token) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    this.isSubmitting.set(true);

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const payload = this.form.getRawValue();

    const request$ = this.editingId() ? this.http.put(`${environment.apiBaseUrl}/interview-questions/${this.editingId()}`, payload, { headers }) : this.http.post(`${environment.apiBaseUrl}/interview-questions`, payload, { headers });

    request$.subscribe({ next: () => this.router.navigateByUrl('/admin'), error: () => this.isSubmitting.set(false) });
  }

  cancel(): void {
    this.router.navigateByUrl('/admin');
  }
}
