import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CardComponent } from '../../shared/components/card.component';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-blog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <app-card>
      <div class="page-head">
        <p class="eyebrow">Admin publishing</p>
        <h2>Post Blog</h2>
        <p class="supporting-text">Publish a clean editorial draft with outline fields and readable spacing.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
        <div class="two-column">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
            <mat-error *ngIf="form.get('title')?.hasError('required')">Title is required.</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Cover image URL</mat-label>
            <input matInput formControlName="coverImageUrl" placeholder="https://..." />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Tags</mat-label>
          <input matInput formControlName="tags" placeholder="career, interview, sql" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="span-2">
          <mat-label>Content</mat-label>
          <textarea matInput formControlName="content" rows="4"></textarea>
          <mat-error *ngIf="form.get('content')?.hasError('required')">Content is required.</mat-error>
        </mat-form-field>

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Publishing…' : 'Publish Blog' }}
          </button>
          <button mat-button type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </app-card>
  `,
  styles: [`
    .page-head {
      display: grid;
      gap: 0.35rem;
      margin-bottom: 1rem;
    }

    .eyebrow {
      color: var(--ff-cta);
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      margin: 0;
    }

    .supporting-text {
      color: var(--ff-muted);
      margin: 0;
    }

    .form-grid {
      display: grid;
      gap: 1rem;
    }

    .two-column {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .span-2 {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    @media (max-width: 720px) {
      .two-column {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PostBlogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    coverImageUrl: [''],
    tags: ['']
  });

  readonly isSubmitting = signal(false);

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
    const { title, content, coverImageUrl, tags } = this.form.getRawValue();
    const payload = {
      title,
      content,
      coverImageUrl: coverImageUrl.trim() || null,
      tags: tags.trim() || null
    };

    this.http.post(`${environment.apiBaseUrl}/blogs`, payload, { headers }).subscribe({
      next: () => this.router.navigateByUrl('/admin'),
      error: () => this.isSubmitting.set(false)
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/admin');
  }
}