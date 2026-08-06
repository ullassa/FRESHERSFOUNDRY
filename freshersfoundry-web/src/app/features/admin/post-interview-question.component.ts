import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CardComponent } from '../../shared/components/card.component';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-interview-question',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent],
  template: `
    <app-card>
      <h2>Post Interview Question</h2>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <label>Category<input formControlName="category" /></label>
        <label>Sub-topic<input formControlName="subTopic" /></label>
        <label>Difficulty
          <select formControlName="difficulty">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
        <label>Question<textarea formControlName="question"></textarea></label>
        <label>Answer<textarea formControlName="answer"></textarea></label>
        <label>Code Snippet<textarea formControlName="codeSnippet"></textarea></label>

        <div style="display:flex;gap:.5rem;margin-top:.5rem;">
          <button type="submit" [disabled]="form.invalid || isSubmitting()">{{ isSubmitting() ? 'Posting…' : 'Post Question' }}</button>
          <button type="button" (click)="cancel()">Cancel</button>
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
