import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CardComponent } from '../../../../shared/components/card.component';
import { AuthService } from '../../../../core/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-post-blog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './post-blog.component.html',
  styleUrls: ['./post-blog.component.css']
})
export class PostBlogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    coverImageUrl: [''],
    tags: ['']
  });

  readonly isSubmitting = signal(false);
  readonly editingId = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.editingId.set(id);
    this.http.get(`${environment.apiBaseUrl}/blogs/${id}`).subscribe({
      next: (res: any) => {
        this.form.patchValue({
          title: res.title,
          content: res.content,
          coverImageUrl: res.coverImageUrl,
          tags: res.tags
        });
      }
    });
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
    const { title, content, coverImageUrl, tags } = this.form.getRawValue();
    const payload = {
      title,
      content,
      coverImageUrl: coverImageUrl.trim() || null,
      tags: tags.trim() || null
    };

    const request$ = this.editingId()
      ? this.http.put(`${environment.apiBaseUrl}/blogs/${this.editingId()}`, payload, { headers })
      : this.http.post(`${environment.apiBaseUrl}/blogs`, payload, { headers });

    request$.subscribe({
      next: () => this.router.navigateByUrl('/admin'),
      error: () => this.isSubmitting.set(false)
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/admin');
  }

  fillSample(): void {
    this.form.patchValue({
      title: 'How I prepared for my first developer interview',
      content: `This article covers the practical steps, study plan, and hands-on projects I used to prepare for entry-level developer interviews.\n\nStart with fundamentals: data structures, algorithms, and system design basics.\n\nPractice coding problems on a schedule and build a small project to demonstrate concepts.\n\nTips: keep answers concise, explain trade-offs, and show real code samples.`,
      coverImageUrl: 'https://images.example.com/blog/dev-interview.jpg',
      tags: 'career,interview,preparation'
    });
  }
}
