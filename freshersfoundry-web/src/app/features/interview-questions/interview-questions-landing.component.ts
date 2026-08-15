import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CardComponent } from '../../shared/components/card.component';
import { TagChipComponent } from '../../shared/components/tag-chip.component';

type DifficultyBucket = 'Easy' | 'Medium' | 'Hard' | 'Other';

interface InterviewQuestionItem {
  category?: string | null;
  difficultyLevel?: string | null;
  difficulty?: string | null;
}

interface TopicSummary {
  key: string;
  label: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

@Component({
  selector: 'app-interview-questions-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CardComponent, TagChipComponent],
  template: `
    <section class="page-wrap">
      <section class="hero-section" *ngIf="!loading()">
        <div class="hero-copy">
          <app-tag-chip label="Interview questions"></app-tag-chip>
          <h1>Master your interview skills topic by topic.</h1>
          <p>
            Explore topic-wise interview questions curated from your existing question bank.
          </p>

          <div class="hero-stats">
            <div class="hero-stat-box">
              <strong>{{ stats().totalTopics }}</strong>
              <span>Topics</span>
            </div>
            <div class="hero-stat-box">
              <strong>{{ stats().totalQuestions }}</strong>
              <span>Questions</span>
            </div>
            <div class="hero-stat-box">
              <strong>{{ stats().easy + stats().medium + stats().hard }}</strong>
              <span>Practice set</span>
            </div>
          </div>
        </div>

        <div class="hero-art" aria-hidden="true">
          <div class="art-orb orb-a"></div>
          <div class="art-orb orb-b"></div>
          <div class="art-orb orb-c"></div>
          <div class="art-card">
            <div class="tick-row" *ngFor="let line of checklistRows">&#10003; {{ line }}</div>
          </div>
          <div class="art-badge">?</div>
        </div>
      </section>

      <div *ngIf="loading()" class="state-card">
        <div class="loading-wrap" aria-live="polite" aria-busy="true">
          <span class="spinner" aria-hidden="true"></span>
          <span>Loading interview topics...</span>
        </div>
      </div>

      <div *ngIf="!loading() && error()" class="state-card error" role="alert">
        <p>{{ error() }}</p>
        <button type="button" class="retry-btn" (click)="retry()">Retry</button>
      </div>

      <ng-container *ngIf="!loading()">
        <section class="panel-block">
          <div class="section-head compact-head">
            <h2>Popular topics</h2>
            <div class="slider-controls" *ngIf="canScrollPopular()">
              <button type="button" (click)="scrollPopular(-1)" aria-label="Scroll popular topics left">&#8249;</button>
              <button type="button" (click)="scrollPopular(1)" aria-label="Scroll popular topics right">&#8250;</button>
            </div>
          </div>

          <div class="popular-track" [class.single]="popularTopics().length <= 1" #popularTrack>
            <button
              type="button"
              class="popular-topic-card"
              *ngFor="let topic of popularTopics(); trackBy: trackTopic"
              (click)="goToTopic(topic.key)"
            >
              <span class="popular-topic-label">{{ topic.label }}</span>
            </button>

            <div class="empty-inline" *ngIf="popularTopics().length === 0">
              No popular topics available yet.
            </div>
          </div>
        </section>

        <section class="panel-block">
          <div class="toolbar">
            <label class="search-field" for="topic-search">
              <span class="sr-only">Search topics</span>
              <input
                id="topic-search"
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange()"
                type="text"
                placeholder="Search topics..."
                autocomplete="off"
              />
            </label>

            <label class="sort-field" for="sort-by">
              <span>Sort by:</span>
              <select id="sort-by" [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
                <option value="popular">Popular</option>
                <option value="name">Name (A-Z)</option>
                <option value="countAsc">Question count</option>
              </select>
            </label>

            <div class="view-toggle" aria-label="View mode">
              <button type="button" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">Grid</button>
              <button type="button" [class.active]="viewMode === 'compact'" (click)="viewMode = 'compact'">List</button>
            </div>
          </div>

          <h3 class="topics-head">Topics</h3>

          <div class="topic-grid" [class.compact]="viewMode === 'compact'" *ngIf="visibleTopics().length > 0; else noMatchesTpl">
            <app-card class="topic-card" *ngFor="let topic of visibleTopics(); trackBy: trackTopic">
              <a class="topic-link" [routerLink]="['/interview-questions/topic', topic.key]">
                <div class="topic-icon" [style.background]="topicIconGradient(topic.label)">
                  {{ topicIconLabel(topic.label) }}
                </div>

                <div class="topic-content">
                  <h3 class="topic-title">{{ topic.label }}</h3>
                  <p class="topic-description">Focused interview questions for {{ topic.label }}.</p>
                  <div class="badge-row">
                    <span class="badge">{{ topic.total }} Questions</span>
                    <span class="badge success">Easy {{ topic.easy }} | Medium {{ topic.medium }} | Hard {{ topic.hard }}</span>
                  </div>
                </div>
              </a>
            </app-card>
          </div>

          <ng-template #noMatchesTpl>
            <div class="state-card empty" *ngIf="error(); else emptyTopicState">Topics are unavailable right now. Retry above.</div>
          </ng-template>

          <ng-template #emptyTopicState>
            <div class="state-card empty" *ngIf="searchTerm.trim().length > 0; else noTopicsState">No topics match your search.</div>
          </ng-template>

          <ng-template #noTopicsState>
            <div class="state-card empty">No interview topics available yet.</div>
          </ng-template>

          <div class="load-more-wrap" *ngIf="visibleTopics().length < sortedTopics().length">
            <button type="button" class="load-more-btn" (click)="loadMoreTopics()">Load More</button>
          </div>
        </section>
      </ng-container>
    </section>
  `,
  styles: [`
    .page-wrap {
      display: grid;
      gap: 1.25rem;
    }

    .hero-section {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 1.25rem;
      padding: 1.6rem;
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 1rem;
      background:
        radial-gradient(circle at 20% 10%, rgba(91, 74, 255, 0.4), transparent 42%),
        radial-gradient(circle at 84% 35%, rgba(101, 199, 255, 0.25), transparent 36%),
        linear-gradient(140deg, #111a49 0%, #10173f 40%, #0b1132 100%);
      color: #f2f6ff;
    }

    .hero-copy {
      display: grid;
      gap: 0.95rem;
      align-content: start;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.55rem, 2.7vw, 2.55rem);
      line-height: 1.25;
      letter-spacing: -0.01em;
      color: #f3f5ff;
    }

    .hero-copy p {
      margin: 0;
      color: rgba(226, 232, 255, 0.88);
      line-height: 1.6;
      max-width: 52ch;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.6rem;
      max-width: 420px;
      margin-top: 0.6rem;
    }

    .hero-stat-box {
      border: 1px solid rgba(186, 197, 255, 0.24);
      border-radius: 0.75rem;
      padding: 0.65rem;
      background: rgba(16, 21, 54, 0.55);
      display: grid;
      gap: 0.2rem;
    }

    .hero-stat-box strong {
      font-size: 1.2rem;
      color: #b8bbff;
    }

    .hero-stat-box span {
      font-size: 0.82rem;
      color: rgba(225, 229, 255, 0.86);
    }

    .hero-art {
      position: relative;
      min-height: 220px;
      border-radius: 0.95rem;
      background: linear-gradient(145deg, rgba(120, 127, 255, 0.15), rgba(16, 22, 58, 0.3));
      border: 1px solid rgba(196, 204, 255, 0.18);
      overflow: hidden;
      display: grid;
      place-items: center;
    }

    .art-card {
      width: 180px;
      border-radius: 1rem;
      background: linear-gradient(170deg, #f5f7ff, #cfd8ff);
      border: 1px solid rgba(86, 98, 203, 0.35);
      box-shadow: 0 16px 35px rgba(8, 14, 50, 0.35);
      padding: 0.8rem;
      transform: rotate(-5deg);
      z-index: 2;
    }

    .tick-row {
      font-size: 0.8rem;
      color: #202a57;
      padding: 0.25rem 0;
      border-bottom: 1px solid rgba(39, 49, 111, 0.12);
    }

    .tick-row:last-child {
      border-bottom: none;
    }

    .art-badge {
      position: absolute;
      right: 1rem;
      top: 1rem;
      width: 42px;
      height: 42px;
      border-radius: 999px;
      background: linear-gradient(140deg, #756cff, #5e53f1);
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 1.2rem;
      color: #fff;
      z-index: 3;
    }

    .art-orb {
      position: absolute;
      border-radius: 999px;
      background: rgba(157, 182, 255, 0.35);
    }

    .orb-a { width: 16px; height: 16px; left: 1.3rem; top: 1.7rem; }
    .orb-b { width: 22px; height: 22px; left: 0.9rem; bottom: 1.1rem; }
    .orb-c { width: 14px; height: 14px; right: 3.8rem; bottom: 0.9rem; }

    .panel-block,
    .state-card {
      background: rgba(255, 255, 255, 0.88);
      border: 1px solid var(--ff-border);
      border-radius: 1rem;
      padding: 1rem;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.9rem;
    }

    .compact-head h2 {
      margin: 0;
      font-size: 1.15rem;
    }

    .slider-controls {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .slider-controls button,
    .retry-btn,
    .load-more-btn,
    .view-toggle button {
      border: 1px solid var(--ff-border);
      background: #fff;
      border-radius: 999px;
      padding: 0.45rem 0.85rem;
      cursor: pointer;
      font-weight: 600;
      color: var(--ff-text);
    }

    .slider-controls button {
      width: 34px;
      height: 34px;
      padding: 0;
      font-size: 1.2rem;
      line-height: 1;
    }

    .popular-track {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: 0.2rem;
      -webkit-overflow-scrolling: touch;
    }

    .popular-track.single {
      overflow-x: visible;
    }

    .popular-topic-card {
      scroll-snap-align: start;
      flex: 0 0 auto;
      max-width: 220px;
      border: 1px solid var(--ff-border);
      border-radius: 0.9rem;
      padding: 0.5rem 0.85rem;
      background: #fff;
      color: var(--ff-text);
      display: inline-flex;
      align-items: center;
      transition: border-color 0.2s ease, transform 0.2s ease;
      font-weight: 600;
    }

    .popular-topic-card:hover {
      border-color: rgba(56, 189, 248, 0.6);
      transform: translateY(-1px);
    }

    .popular-topic-label {
      font-size: 0.86rem;
      line-height: 1.2;
      overflow-wrap: anywhere;
      text-align: left;
    }

    .empty-inline {
      color: var(--ff-muted);
      font-size: 0.9rem;
      padding: 0.3rem 0;
    }

    .toolbar {
      display: grid;
      grid-template-columns: minmax(220px, 1fr) auto auto;
      gap: 0.7rem;
      align-items: center;
      margin-bottom: 0.85rem;
    }

    .search-field input,
    .sort-field select {
      width: 100%;
      border: 1px solid var(--ff-border);
      border-radius: 0.7rem;
      padding: 0.68rem 0.82rem;
      background: #fff;
      color: var(--ff-text);
    }

    .sort-field {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--ff-muted);
      white-space: nowrap;
    }

    .view-toggle {
      display: inline-flex;
      border: 1px solid var(--ff-border);
      border-radius: 0.72rem;
      overflow: hidden;
      background: #fff;
    }

    .view-toggle button {
      border: none;
      border-radius: 0;
      padding: 0.6rem 0.7rem;
      font-size: 0.82rem;
      min-width: 56px;
    }

    .view-toggle button.active {
      background: rgba(99, 102, 241, 0.14);
      color: #3f3acb;
    }

    .topics-head {
      margin: 0 0 0.8rem;
      font-size: 1rem;
    }

    .topic-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 0.85rem;
    }

    .topic-grid.compact {
      grid-template-columns: 1fr;
    }

    .topic-card {
      display: block;
      height: 100%;
    }

    .topic-link {
      display: flex;
      gap: 0.8rem;
      align-items: flex-start;
      height: 100%;
    }

    .topic-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.75rem;
      display: grid;
      place-items: center;
      color: #fff;
      font-weight: 800;
      flex-shrink: 0;
      padding: 0.2rem;
      text-align: center;
      font-size: 0.84rem;
      letter-spacing: 0.02em;
    }

    .topic-content {
      display: grid;
      gap: 0.45rem;
      min-width: 0;
    }

    .topic-title {
      margin: 0;
      font-size: 1.02rem;
      line-height: 1.35;
      overflow-wrap: anywhere;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 2.7rem;
    }

    .topic-description {
      margin: 0;
      color: var(--ff-muted);
      font-size: 0.87rem;
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .badge-row {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .badge {
      border-radius: 999px;
      border: 1px solid var(--ff-border);
      background: #fff;
      padding: 0.3rem 0.6rem;
      font-size: 0.75rem;
      color: var(--ff-muted);
    }

    .badge.success {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.22);
      color: #047857;
    }

    .load-more-wrap {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
    }

    .load-more-btn {
      min-width: 140px;
      background: linear-gradient(135deg, #6f63ff, #5a4fe8);
      border-color: transparent;
      color: #fff;
    }

    .load-more-btn:hover {
      filter: brightness(0.96);
    }

    .state-card {
      text-align: center;
    }

    .state-card.error {
      color: var(--ff-danger);
    }

    .state-card p {
      margin: 0 0 0.8rem;
    }

    .loading-wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      color: var(--ff-muted);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      border: 2px solid var(--ff-border);
      border-top-color: var(--ff-cta);
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 860px) {
      .hero-section {
        grid-template-columns: 1fr;
      }

      .hero-art {
        min-height: 180px;
      }

      .toolbar {
        grid-template-columns: 1fr;
      }

      .sort-field {
        justify-content: space-between;
      }

      .view-toggle {
        width: 100%;
      }

      .view-toggle button {
        flex: 1;
      }
    }

    @media (max-width: 640px) {
      .page-wrap {
        gap: 1rem;
      }

      .hero-section,
      .panel-block,
      .state-card {
        padding: 0.85rem;
      }

      .section-head {
        flex-direction: column;
        align-items: flex-start;
      }

      .slider-controls {
        width: 100%;
      }

      .slider-controls button {
        flex: 1;
      }

      .hero-stats {
        grid-template-columns: 1fr;
        max-width: none;
      }

      .topic-link {
        flex-direction: column;
      }

      .topic-icon {
        width: 42px;
        height: 42px;
      }
    }
  `]
})
export class InterviewQuestionsLandingComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  @ViewChild('popularTrack') popularTrack?: ElementRef<HTMLDivElement>;

  readonly items = signal<InterviewQuestionItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly visibleCount = signal(6);
  readonly checklistRows = ['Category coverage', 'Difficulty spread', 'Daily practice'];

  searchTerm = '';
  sortBy: 'popular' | 'name' | 'countAsc' = 'popular';
  viewMode: 'grid' | 'compact' = 'grid';

  readonly topics = computed<TopicSummary[]>(() => {
    const grouped = new Map<string, TopicSummary>();

    for (const item of this.items()) {
      const category = this.normalizeCategory(item.category);
      const existing = grouped.get(category) ?? {
        key: category,
        label: category,
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0
      };

      existing.total += 1;
      const difficulty = this.normalizeDifficulty(item.difficultyLevel ?? item.difficulty);
      if (difficulty === 'Easy') existing.easy += 1;
      if (difficulty === 'Medium') existing.medium += 1;
      if (difficulty === 'Hard') existing.hard += 1;

      grouped.set(category, existing);
    }

    return Array.from(grouped.values()).sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return a.label.localeCompare(b.label);
    });
  });

  readonly filteredTopics = computed(() => {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) return this.topics();
    return this.topics().filter((topic) => topic.label.toLowerCase().includes(query));
  });

  readonly sortedTopics = computed(() => {
    const source = [...this.filteredTopics()];

    if (this.sortBy === 'name') {
      return source.sort((a, b) => a.label.localeCompare(b.label));
    }

    if (this.sortBy === 'countAsc') {
      return source.sort((a, b) => (a.total - b.total) || a.label.localeCompare(b.label));
    }

    return source.sort((a, b) => (b.total - a.total) || a.label.localeCompare(b.label));
  });

  readonly visibleTopics = computed(() => this.sortedTopics().slice(0, this.visibleCount()));

  readonly popularTopics = computed(() => this.topics().slice(0, 8));

  readonly canScrollPopular = computed(() => this.popularTopics().length > 1);

  readonly stats = computed(() => {
    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const item of this.items()) {
      const difficulty = this.normalizeDifficulty(item.difficultyLevel ?? item.difficulty);
      if (difficulty === 'Easy') easy += 1;
      if (difficulty === 'Medium') medium += 1;
      if (difficulty === 'Hard') hard += 1;
    }

    return {
      totalTopics: this.topics().length,
      totalQuestions: this.items().length,
      easy,
      medium,
      hard
    };
  });

  ngOnInit(): void {
    this.load();
  }

  retry(): void {
    this.load();
  }

  onSearchChange(): void {
    this.visibleCount.set(6);
  }

  onSortChange(): void {
    this.visibleCount.set(6);
  }

  loadMoreTopics(): void {
    this.visibleCount.update((value) => value + 6);
  }

  goToTopic(category: string): void {
    this.router.navigate(['/interview-questions/topic', category]);
  }

  scrollPopular(direction: -1 | 1): void {
    if (!this.canScrollPopular()) return;

    const track = this.popularTrack?.nativeElement;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>('.popular-topic-card');
    const step = firstCard ? firstCard.offsetWidth + 12 : 280;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  }

  trackTopic(_index: number, topic: TopicSummary): string {
    return topic.key;
  }

  topicIconLabel(label: string): string {
    const words = label.split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'IQ';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
  }

  topicIconGradient(label: string): string {
    const gradients = [
      'linear-gradient(135deg, #f59e0b, #f97316)',
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #0ea5e9, #0284c7)',
      'linear-gradient(135deg, #6366f1, #4f46e5)',
      'linear-gradient(135deg, #14b8a6, #0f766e)'
    ];

    const seed = Array.from(label).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[seed % gradients.length];
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<{ items?: InterviewQuestionItem[] }>(`${environment.apiBaseUrl}/interview-questions`).subscribe({
      next: (response) => {
        this.items.set(response?.items ?? []);
        this.visibleCount.set(6);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Unable to load interview topics right now.');
      }
    });
  }

  private normalizeCategory(value: string | null | undefined): string {
    const trimmed = (value ?? '').trim();
    return trimmed.length > 0 ? trimmed : 'Uncategorized';
  }

  private normalizeDifficulty(value: string | null | undefined): DifficultyBucket {
    const normalized = (value ?? '').trim().toLowerCase();
    if (normalized === 'easy') return 'Easy';
    if (normalized === 'medium') return 'Medium';
    if (normalized === 'hard') return 'Hard';
    return 'Other';
  }
}
