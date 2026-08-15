import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-interview-questions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="page-wrap">
      <header class="topbar">
        <div>
          <h2>Interview Questions</h2>
          <p>Practice common interview patterns by category, subtopic, and difficulty.</p>
        </div>
        <button *ngIf="isAdmin()" type="button" class="primary-btn" routerLink="/admin/post-question">Add question</button>
      </header>

      <div class="filters">
        <label class="search-field">
          <span>Search</span>
          <input [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search question text" />
        </label>

        <div class="filter-grid">
          <label>
            <span>Category</span>
            <select [(ngModel)]="selectedCategory" (change)="applyFilters()">
              <option value="">All</option>
              <option *ngFor="let category of categories()" [value]="category">{{ category }}</option>
            </select>
          </label>

          <label>
            <span>Subtopic</span>
            <select [(ngModel)]="selectedSubTopic" (change)="applyFilters()">
              <option value="">All</option>
              <option *ngFor="let sub of subTopics()" [value]="sub">{{ sub }}</option>
            </select>
          </label>

          <label>
            <span>Difficulty</span>
            <select [(ngModel)]="selectedDifficulty" (change)="applyFilters()">
              <option value="">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>
        </div>
      </div>

      <div *ngIf="loading()" class="state-card">Loading questions...</div>
      <div *ngIf="!loading() && error()" class="state-card error">{{ error() }}</div>

      <div class="question-grid" *ngIf="!loading() && !error() && filteredQuestions().length > 0">
        <article class="question-card" *ngFor="let q of filteredQuestions()" [routerLink]="['/interview-questions', q.id]">
          <div class="meta-row">
            <span class="badge">{{ q.category }}</span>
            <span class="badge muted">{{ q.subTopic || 'General' }}</span>
            <span class="badge muted">{{ q.difficultyLevel || q.difficulty }}</span>
          </div>
          <h3>{{ q.question }}</h3>
          <p class="answer-preview">{{ getExcerpt(q.answer) }}</p>
          <div class="action-row">
            <a [routerLink]="['/interview-questions', q.id]">View answer</a>
            <span *ngIf="isAdmin()" class="admin-actions">
              <button type="button" (click)="$event.stopPropagation(); edit(q.id)">Edit</button>
              <button type="button" (click)="$event.stopPropagation(); delete(q.id)">Delete</button>
            </span>
          </div>
        </article>
      </div>

      <div *ngIf="!loading() && !error() && filteredQuestions().length === 0" class="state-card empty">
        No questions match the selected filters.
      </div>
    </section>
  `,
  styles: [`
    .page-wrap { display: grid; gap: 1.25rem; }
    .topbar { display: flex; justify-content: space-between; align-items: end; gap: 1rem; }
    .topbar p { color: var(--ff-muted); margin: 0.25rem 0 0; }
    .primary-btn { border: none; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: white; border-radius: 999px; padding: 0.7rem 1rem; font-weight: 600; cursor: pointer; }
    .filters { background: rgba(255,255,255,0.82); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 1rem; display: grid; gap: 1rem; }
    .search-field, .filter-grid { display: grid; gap: 0.5rem; }
    .filter-grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
    label { display: grid; gap: 0.35rem; color: var(--ff-muted); }
    input, select { width: 100%; padding: 0.75rem 0.9rem; border: 1px solid var(--ff-border); border-radius: 0.8rem; background: #fff; }
    .question-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
    .question-card { background: rgba(255,255,255,0.82); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 1rem; display: grid; gap: 0.8rem; cursor: pointer; }
    .meta-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .badge { background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.2); border-radius: 999px; padding: 0.3rem 0.6rem; font-size: 0.72rem; }
    .badge.muted { background: rgba(15,23,42,0.03); }
    .answer-preview { margin: 0; color: rgba(15,23,42,0.72); line-height: 1.6; }
    .action-row { display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; }
    .admin-actions { display: flex; gap: 0.5rem; }
    .admin-actions button { border: 1px solid var(--ff-border); background: #fff; border-radius: 999px; padding: 0.35rem 0.7rem; cursor: pointer; }
    .state-card { background: rgba(255,255,255,0.82); border: 1px solid var(--ff-border); border-radius: 1rem; padding: 2rem; text-align: center; }
    .state-card.error { color: var(--ff-danger); }
    @media (max-width: 640px) { .topbar { flex-direction: column; align-items: flex-start; } }
  `]
})
export class InterviewQuestionsComponent {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly items = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  searchTerm = '';
  selectedCategory = '';
  selectedSubTopic = '';
  selectedDifficulty = '';

  readonly categories = computed(() => Array.from(new Set(this.items().map((item) => this.normalizeCategory(item.category)))));
  readonly subTopics = computed(() => Array.from(new Set(this.items().map((item) => item.subTopic).filter(Boolean))));

  readonly filteredQuestions = computed(() => {
    const query = this.searchTerm.trim().toLowerCase();
    return this.items().filter((item) => {
      const haystack = `${item.category || ''} ${item.subTopic || ''} ${item.question || ''} ${item.answer || ''}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesCategory = !this.selectedCategory || this.normalizeCategory(item.category) === this.selectedCategory;
      const matchesSubTopic = !this.selectedSubTopic || item.subTopic === this.selectedSubTopic;
      const matchesDifficulty = !this.selectedDifficulty || (item.difficultyLevel || item.difficulty) === this.selectedDifficulty;
      return matchesQuery && matchesCategory && matchesSubTopic && matchesDifficulty;
    });
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.selectedCategory = (params.get('category') || '').trim();
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get(`${environment.apiBaseUrl}/interview-questions`).subscribe({
      next: (response: any) => {
        this.items.set(response?.items || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load questions right now.');
      }
    });
  }

  applyFilters(): void {
    // no-op while using computed filtering; kept for test expectations and future API filter input hooks.
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  edit(id: string) {
    this.router.navigateByUrl(`/admin/post-question/${id}`);
  }

  delete(id: string) {
    if (!confirm('Delete this question?')) return;
    this.http.delete(`${environment.apiBaseUrl}/interview-questions/${id}`).subscribe(() => this.load());
  }

  getExcerpt(value: string): string {
    const plain = (value || '').replace(/[#>*_`\-]/g, '').replace(/\s+/g, ' ').trim();
    return plain.length > 130 ? `${plain.slice(0, 127).trim()}...` : plain;
  }

  private normalizeCategory(value: string | null | undefined): string {
    const trimmed = (value || '').trim();
    return trimmed.length > 0 ? trimmed : 'Uncategorized';
  }
}
