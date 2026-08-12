import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MarkdownRendererComponent } from '../../shared/components/markdown-renderer.component';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownRendererComponent, DatePipe],
  template: `
    <article class="page-wrap" *ngIf="!loading() && blog(); else loadingTpl">
      <div class="hero" *ngIf="blog()?.coverImageUrl">
        <img [src]="blog()?.coverImageUrl" [alt]="blog()?.title" />
      </div>

      <header class="header">
        <div class="eyebrow">Blog</div>
        <h2>{{ blog()?.title }}</h2>
        <div class="meta-row">
          <span>By {{ blog()?.authorName || 'FreshersFoundry' }}</span>
          <span>•</span>
          <span>{{ blog()?.createdAt | date:'mediumDate' }}</span>
        </div>
        <div class="chip-row" *ngIf="tags().length">
          <span class="chip" *ngFor="let tag of tags()">{{ tag }}</span>
        </div>
      </header>

      <app-markdown-renderer [markdown]="blog()?.content || ''"></app-markdown-renderer>
    </article>

    <ng-template #loadingTpl>
      <div class="state-card">
        <div *ngIf="loading(); else errorTpl">Loading blog...</div>
      </div>
      <ng-template #errorTpl>
        <div class="state-card error">Unable to load this blog right now.</div>
      </ng-template>
    </ng-template>
  `,
  styles: [`
    .page-wrap { max-width: 900px; margin: 0 auto; display: grid; gap: 1.25rem; }
    .hero { border-radius: 1rem; overflow: hidden; border: 1px solid var(--ff-border); background: #fff; }
    .hero img { display: block; width: 100%; height: 320px; object-fit: cover; }
    .header { display: grid; gap: 0.5rem; }
    .eyebrow { color: #0f766e; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; }
    .meta-row, .chip-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; color: var(--ff-muted); }
    .chip { background: rgba(56, 189, 248, 0.08); color: #0f172a; border: 1px solid var(--ff-border); padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.8rem; }
    .state-card { background: rgba(255,255,255,0.8); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 2rem; text-align: center; }
    .error { color: var(--ff-danger); }
  `]
})
export class BlogDetailComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly blog = signal<any | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly tags = signal<string[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.error.set('Blog not found.');
      return;
    }

    this.http.get(`${environment.apiBaseUrl}/blogs/${id}`).subscribe({
      next: (item: any) => {
        this.blog.set(item);
        this.tags.set((item.tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load this blog right now.');
      }
    });
  }
}
