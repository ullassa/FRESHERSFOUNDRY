import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  template: `
    <section class="page-wrap">
      <header class="topbar">
        <div>
          <h2>Blogs</h2>
          <p>Creator blogs, sponsored placements, and editorial content for freshers.</p>
        </div>
        <button class="primary-btn" type="button" routerLink="/admin/post-blog" *ngIf="auth.isAdmin()">Write a blog</button>
      </header>

      <div class="toolbar">
        <label class="search-field">
          <span>Search</span>
          <input [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search blogs or tags" />
        </label>

        <div class="tag-list" *ngIf="tags().length">
          <button type="button" class="tag-btn" [class.active]="selectedTag() === tag" *ngFor="let tag of tags()" (click)="toggleTag(tag)">
            {{ tag }}
          </button>
        </div>
      </div>

      <div *ngIf="loading()" class="state-card">Loading blogs...</div>
      <div *ngIf="!loading() && error()" class="state-card error">{{ error() }}</div>

      <div class="blog-grid" *ngIf="!loading() && !error() && filteredItems().length > 0">
        <article class="blog-card" *ngFor="let blog of filteredItems()">
          <img *ngIf="blog.coverImageUrl" [src]="blog.coverImageUrl" [alt]="blog.title" class="cover" />
          <div class="card-body">
            <div class="chip-row" *ngIf="getTags(blog.tags).length">
              <span class="chip" *ngFor="let tag of getTags(blog.tags)">{{ tag }}</span>
            </div>
            <h3>{{ blog.title }}</h3>
            <p class="excerpt">{{ getExcerpt(blog.content) }}</p>
            <div class="meta-row">
              <span>{{ blog.authorName || 'FreshersFoundry' }}</span>
              <span>•</span>
              <span>{{ blog.createdAt | date:'mediumDate' }}</span>
            </div>
            <a class="read-link" [routerLink]="['/blogs', blog.id]">Read article</a>
          </div>
        </article>
      </div>

      <div *ngIf="!loading() && !error() && filteredItems().length === 0" class="state-card empty">
        No blogs published yet.
      </div>

      <div class="pagination" *ngIf="pageCount() > 1">
        <button type="button" (click)="page.set(Math.max(1, page()-1))" [disabled]="page() === 1">Previous</button>
        <span>Page {{ page() }} of {{ pageCount() }}</span>
        <button type="button" (click)="page.set(Math.min(pageCount(), page()+1))" [disabled]="page() === pageCount()">Next</button>
      </div>
    </section>
  `,
  styles: [`
    .page-wrap { display: grid; gap: 1.25rem; }
    .topbar { display: flex; justify-content: space-between; align-items: end; gap: 1rem; }
    .topbar p { color: var(--ff-muted); margin: 0.25rem 0 0; }
    .toolbar { display: grid; gap: 1rem; }
    .search-field { display: grid; gap: 0.35rem; color: var(--ff-muted); }
    .search-field input { width: 100%; padding: 0.8rem 1rem; border: 1px solid var(--ff-border); border-radius: 0.8rem; background: rgba(255,255,255,0.8); }
    .tag-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .tag-btn { border: 1px solid var(--ff-border); background: white; border-radius: 999px; padding: 0.45rem 0.8rem; cursor: pointer; }
    .tag-btn.active { background: rgba(56,189,248,0.12); border-color: rgba(56,189,248,0.5); }
    .primary-btn { border: none; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; border-radius: 999px; padding: 0.7rem 1rem; font-weight: 600; cursor: pointer; }
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
    .blog-card { background: rgba(255,255,255,0.82); border: 1px solid var(--ff-border); border-radius: 1rem; overflow: hidden; }
    .cover { width: 100%; height: 180px; object-fit: cover; }
    .card-body { display: grid; gap: 0.8rem; padding: 1rem; }
    .chip-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .chip { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.2); border-radius: 999px; padding: 0.26rem 0.6rem; font-size: 0.72rem; }
    .excerpt { margin: 0; color: rgba(15,23,42,0.75); line-height: 1.6; }
    .meta-row { display: flex; flex-wrap: wrap; gap: 0.45rem; color: var(--ff-muted); font-size: 0.84rem; }
    .read-link { font-weight: 600; color: #0f172a; }
    .state-card { background: rgba(255,255,255,0.82); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 2rem; text-align: center; }
    .state-card.error { color: var(--ff-danger); }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1rem 0 0; }
    .pagination button { background: #fff; border: 1px solid var(--ff-border); border-radius: 0.6rem; padding: 0.5rem 0.8rem; cursor: pointer; }
    @media (max-width: 640px) { .topbar { flex-direction: column; align-items: flex-start; } }
  `]
})
export class BlogsComponent {
  private readonly http = inject(HttpClient);
  readonly auth = inject(AuthService);

  readonly items = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  searchTerm = '';
  readonly selectedTag = signal('');
  readonly page = signal(1);
  private readonly pageSize = 6;

  readonly tags = computed(() => Array.from(new Set(this.items().flatMap((item) => this.getTags(item.tags)))));

  readonly filteredItems = computed(() => {
    const query = this.searchTerm.trim().toLowerCase();
    const tag = this.selectedTag().trim().toLowerCase();
    const filtered = this.items().filter((item) => {
      const haystack = `${item.title || ''} ${item.content || ''} ${item.tags || ''}`.toLowerCase();
      const matchesText = !query || haystack.includes(query);
      const matchesTag = !tag || this.getTags(item.tags).some((value) => value.toLowerCase() === tag);
      return matchesText && matchesTag;
    });
    const start = (this.page() - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  });

  readonly pageCount = computed(() => {
    const query = this.searchTerm.trim().toLowerCase();
    const tag = this.selectedTag().trim().toLowerCase();
    const total = this.items().filter((item) => {
      const haystack = `${item.title || ''} ${item.content || ''} ${item.tags || ''}`.toLowerCase();
      const matchesText = !query || haystack.includes(query);
      const matchesTag = !tag || this.getTags(item.tags).some((value) => value.toLowerCase() === tag);
      return matchesText && matchesTag;
    }).length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get(`${environment.apiBaseUrl}/blogs`).subscribe({
      next: (response: any) => {
        this.items.set((response?.items || response || []).map((item: any) => ({ ...item, authorName: item.authorName || item.author || 'FreshersFoundry' })));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load blogs right now.');
      }
    });
  }

  applyFilters(): void {
    this.page.set(1);
  }

  toggleTag(tag: string): void {
    this.selectedTag.set(this.selectedTag() === tag ? '' : tag);
    this.page.set(1);
  }

  getTags(value: string | null | undefined): string[] {
    return (value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  getExcerpt(content: string): string {
    const text = (content || '').replace(/[#>*_`\-]/g, '').replace(/\s+/g, ' ').trim();
    return text.length > 180 ? `${text.slice(0, 177).trim()}...` : text;
  }
}

