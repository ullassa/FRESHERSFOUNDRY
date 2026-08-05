import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth.service';
import { CardComponent } from '../../shared/components/card.component';
import {
  AdminDashboardResponse,
  AdminDashboardService,
  AdminMetric,
  AdminSearchResponse
} from './admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="admin-shell" [class.collapsed]="sidebarCollapsed()">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-mark">FF</div>
          <div class="brand-copy" *ngIf="!sidebarCollapsed()">
            <strong>FreshersFoundry</strong>
            <span>Admin control room</span>
          </div>
        </div>

        <button class="toggle-btn" type="button" (click)="toggleSidebar()">
          {{ sidebarCollapsed() ? 'Expand' : 'Collapse' }}
        </button>

        <nav class="sidebar-nav">
          <button type="button" class="nav-item active" (click)="scrollTo('overview')">
            <span class="nav-icon">DB</span>
            <span *ngIf="!sidebarCollapsed()">Dashboard</span>
          </button>
          <button type="button" class="nav-item" (click)="scrollTo('jobs')">
            <span class="nav-icon">J</span>
            <span *ngIf="!sidebarCollapsed()">Jobs</span>
          </button>
          <button type="button" class="nav-item" (click)="scrollTo('blogs')">
            <span class="nav-icon">B</span>
            <span *ngIf="!sidebarCollapsed()">Blogs</span>
          </button>
          <button type="button" class="nav-item" (click)="scrollTo('interview-experiences')">
            <span class="nav-icon">IE</span>
            <span *ngIf="!sidebarCollapsed()">Interview Experiences</span>
          </button>
          <button type="button" class="nav-item" (click)="scrollTo('interview-questions')">
            <span class="nav-icon">IQ</span>
            <span *ngIf="!sidebarCollapsed()">Interview Questions</span>
          </button>
          <button type="button" class="nav-item" (click)="scrollTo('creators')">
            <span class="nav-icon">CR</span>
            <span *ngIf="!sidebarCollapsed()">Creators</span>
          </button>
          <button type="button" class="nav-item" (click)="scrollTo('users')">
            <span class="nav-icon">U</span>
            <span *ngIf="!sidebarCollapsed()">Users</span>
          </button>
          <button type="button" class="nav-item" (click)="scrollTo('analytics')">
            <span class="nav-icon">AN</span>
            <span *ngIf="!sidebarCollapsed()">Reports & Analytics</span>
          </button>
          <button type="button" class="nav-item" (click)="logout()">
            <span class="nav-icon">⎋</span>
            <span *ngIf="!sidebarCollapsed()">Logout</span>
          </button>
        </nav>
      </aside>

      <main class="admin-main">
        <header class="toolbar" id="overview">
          <div>
            <p class="eyebrow">Live admin dashboard</p>
            <h1>Startup-grade control panel</h1>
          </div>

          <div class="toolbar-actions">
            <div class="search-shell">
              <input
                #searchInput
                type="search"
                [value]="searchQuery()"
                placeholder="Search jobs, blogs, questions, users, companies, creators"
                (input)="searchQuery.set(searchInput.value)"
                (keyup.enter)="runSearch(searchInput.value)"
              />
              <button type="button" (click)="runSearch(searchInput.value)">Search</button>
            </div>
            <button class="ghost-btn" type="button" (click)="loadDashboard()">Refresh</button>
          </div>
        </header>

        <section class="search-results">
          <app-card>
            <div class="panel-head compact">
              <div>
                <p class="eyebrow">Global search</p>
                <h2>{{ searchResults().query ? 'Matching live records' : 'Search across the database' }}</h2>
              </div>
            </div>

            <div class="search-empty" *ngIf="!searchResults().results.length && !searchLoading()">
              No Data Found
            </div>

            <div class="search-loading" *ngIf="searchLoading()">Searching live records...</div>

            <div class="search-list" *ngIf="searchResults().results.length">
              <button
                type="button"
                class="search-item"
                *ngFor="let item of searchResults().results; trackBy: trackBySearchResult"
                (click)="scrollTo(item.sectionId)"
              >
                <span class="result-type">{{ item.type }}</span>
                <strong>{{ item.title }}</strong>
                <span>{{ item.subtitle }}</span>
              </button>
            </div>
          </app-card>
        </section>

        <section class="state-panel" *ngIf="loading()">
          <app-card>
            <div class="skeleton-grid">
              <div class="skeleton-card" *ngFor="let item of skeletonCards"></div>
            </div>
          </app-card>
        </section>

        <section class="state-panel error-panel" *ngIf="error() as errorMessage">
          <app-card>
            <strong>Unable to load dashboard.</strong>
            <p>{{ errorMessage }}</p>
          </app-card>
        </section>

        <section class="metrics-grid" *ngIf="dashboard() as data">
          <button
            type="button"
            class="metric-link"
            *ngFor="let metric of data.metrics; trackBy: trackByMetric"
            (click)="scrollTo(metric.sectionId)"
          >
            <app-card>
              <div class="metric-card" [attr.id]="metric.sectionId">
                <span class="metric-icon">{{ iconLabel(metric) }}</span>
                <div class="metric-copy">
                  <span>{{ metric.label }}</span>
                  <strong>{{ displayMetric(metric) }}</strong>
                  <small>{{ displayChange(metric) }}</small>
                </div>
              </div>
            </app-card>
          </button>
        </section>

        <section class="quick-actions" *ngIf="dashboard() as data">
          <app-card>
            <div class="panel-head">
              <div>
                <p class="eyebrow">Admin quick actions</p>
                <h2>Shortcuts for live content operations</h2>
              </div>
            </div>

            <div class="action-grid">
              <button
                type="button"
                class="action-button"
                *ngFor="let action of data.quickActions; trackBy: trackByQuickAction"
                (click)="scrollTo(action.sectionId)"
                [class.primary]="action.variant === 'primary'"
              >
                {{ action.label }}
              </button>
            </div>
          </app-card>
        </section>

        <section class="content-grid" *ngIf="dashboard() as data">
          <app-card class="activity-section" *ngFor="let group of data.recentActivity; trackBy: trackByActivityGroup">
            <div class="panel-head" [attr.id]="group.key">
              <div>
                <p class="eyebrow">Recent activity</p>
                <h2>{{ group.title }}</h2>
              </div>
            </div>

            <div class="activity-list" *ngIf="group.items.length; else emptyActivity">
              <button
                type="button"
                class="activity-item"
                *ngFor="let item of group.items; trackBy: trackByActivityItem"
                (click)="scrollTo(item.sectionId)"
              >
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.subtitle }}</span>
                </div>
                <span class="status-chip">{{ item.status }}</span>
              </button>
            </div>

            <ng-template #emptyActivity>
              <div class="empty-state">{{ group.emptyState }}</div>
            </ng-template>
          </app-card>
        </section>

        <section class="module-grid" *ngIf="dashboard() as data">
          <app-card>
            <div class="panel-head">
              <div>
                <p class="eyebrow">Workspace modules</p>
                <h2>Admin surfaces backed by live data</h2>
              </div>
            </div>

            <div class="module-list">
              <div class="module-row" id="jobs">
                <span>Jobs</span>
                <strong>{{ metricValue(data.metrics, 'totalJobs') }}</strong>
              </div>
              <div class="module-row" id="blogs">
                <span>Blogs</span>
                <strong>{{ metricValue(data.metrics, 'blogs') }}</strong>
              </div>
              <div class="module-row" id="interview-experiences">
                <span>Interview Experiences</span>
                <strong>{{ metricValue(data.metrics, 'interviewExperiences') }}</strong>
              </div>
              <div class="module-row" id="interview-questions">
                <span>Interview Questions</span>
                <strong>{{ metricValue(data.metrics, 'questions') }}</strong>
              </div>
              <div class="module-row" id="users">
                <span>Users</span>
                <strong>{{ metricValue(data.metrics, 'users') }}</strong>
              </div>
              <div class="module-row" id="creators">
                <span>Creators</span>
                <strong>{{ metricValue(data.metrics, 'premiumMembers') }}</strong>
              </div>
              <div class="module-row" id="companies">
                <span>Companies</span>
                <strong>No Data Found</strong>
              </div>
              <div class="module-row" id="courses">
                <span>Courses</span>
                <strong>{{ metricValue(data.metrics, 'courses') }}</strong>
              </div>
              <div class="module-row" id="webinars">
                <span>Webinars</span>
                <strong>No Data Found</strong>
              </div>
              <div class="module-row" id="advertisements">
                <span>Advertisements</span>
                <strong>No Data Found</strong>
              </div>
              <div class="module-row" id="premium-plans">
                <span>Premium Plans</span>
                <strong>No Data Found</strong>
              </div>
              <div class="module-row" id="analytics">
                <span>Reports & Analytics</span>
                <strong>{{ metricValue(data.metrics, 'websiteVisitors') }}</strong>
              </div>
              <div class="module-row" id="settings">
                <span>Settings</span>
                <strong>No Data Found</strong>
              </div>
            </div>
          </app-card>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    h1, h2, p {
      margin: 0;
    }

    .admin-shell {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      gap: 1rem;
      align-items: start;
    }

    .admin-shell.collapsed {
      grid-template-columns: 92px minmax(0, 1fr);
    }

    .sidebar,
    .admin-main {
      min-width: 0;
    }

    .sidebar {
      position: sticky;
      top: 1rem;
      padding: 1rem;
      border: 1px solid var(--ff-border);
      border-radius: 1.5rem;
      background: rgba(255, 255, 255, 0.92);
      box-shadow: var(--ff-shadow);
      backdrop-filter: blur(12px);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 1rem;
    }

    .brand-mark {
      display: grid;
      place-items: center;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 1rem;
      background: linear-gradient(135deg, #0f172a, #38bdf8);
      color: #fff;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    .brand-copy {
      display: grid;
      gap: 0.15rem;
    }

    .brand-copy span,
    .toggle-btn {
      color: var(--ff-muted);
      font-size: 0.9rem;
    }

    .toggle-btn {
      width: 100%;
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 0.9rem;
      border: 1px solid var(--ff-border);
      background: linear-gradient(180deg, #fff, #f7fbff);
      cursor: pointer;
    }

    .sidebar-nav {
      display: grid;
      gap: 0.45rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.8rem 0.9rem;
      border: 1px solid transparent;
      border-radius: 1rem;
      background: transparent;
      color: var(--ff-text);
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
      text-align: left;
    }

    .nav-item:hover,
    .nav-item.active {
      background: linear-gradient(180deg, #fff, #f7fbff);
      border-color: var(--ff-border);
      transform: translateX(2px);
    }

    .nav-icon {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: 0.7rem;
      background: rgba(56, 189, 248, 0.12);
      color: #0f172a;
      font-size: 0.74rem;
      font-weight: 800;
      flex: 0 0 auto;
    }

    .admin-main {
      display: grid;
      gap: 1rem;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: end;
      padding: 1.1rem 1.25rem;
      border: 1px solid var(--ff-border);
      border-radius: 1.5rem;
      background: rgba(255, 255, 255, 0.88);
      box-shadow: var(--ff-shadow);
      backdrop-filter: blur(12px);
    }

    .eyebrow {
      color: var(--ff-cta);
      font-size: 0.76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }

    h1 {
      margin-top: 0.35rem;
      font-size: clamp(1.7rem, 3vw, 2.65rem);
      line-height: 1.05;
      letter-spacing: -0.05em;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: end;
    }

    .search-shell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem;
      border: 1px solid var(--ff-border);
      border-radius: 1rem;
      background: #fff;
    }

    .search-shell input {
      width: min(38vw, 24rem);
      border: 0;
      outline: none;
      padding: 0.55rem 0.7rem;
      background: transparent;
      color: var(--ff-text);
    }

    .search-shell button,
    .ghost-btn {
      border: 0;
      cursor: pointer;
      border-radius: 0.8rem;
      padding: 0.72rem 1rem;
      font-weight: 700;
    }

    .search-shell button {
      background: var(--ff-cta);
      color: #fff;
    }

    .ghost-btn {
      background: #fff;
      border: 1px solid var(--ff-border);
      color: var(--ff-text);
    }

    .search-results,
    .state-panel,
    .metrics-grid,
    .quick-actions,
    .content-grid,
    .module-grid {
      display: grid;
      gap: 1rem;
    }

    .metrics-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .metric-link {
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      text-align: left;
    }

    .metric-card {
      display: flex;
      align-items: flex-start;
      gap: 0.95rem;
      min-height: 6.75rem;
    }

    .metric-icon {
      display: grid;
      place-items: center;
      width: 2.65rem;
      height: 2.65rem;
      border-radius: 1rem;
      background: rgba(56, 189, 248, 0.12);
      color: var(--ff-surface-strong);
      font-weight: 800;
      flex: 0 0 auto;
    }

    .metric-copy {
      display: grid;
      gap: 0.28rem;
    }

    .metric-copy span,
    .metric-copy small,
    .activity-item span,
    .search-item span,
    .empty-state,
    .search-empty,
    .search-loading,
    .module-row span,
    .brand-copy span {
      color: var(--ff-muted);
    }

    .metric-copy strong {
      font-size: 1.65rem;
      line-height: 1;
    }

    .panel-head {
      margin-bottom: 0.9rem;
    }

    .panel-head h2 {
      margin-top: 0.35rem;
      font-size: 1.2rem;
      letter-spacing: -0.03em;
    }

    .compact {
      margin-bottom: 0.2rem;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .action-button {
      min-height: 3.1rem;
      border: 1px solid var(--ff-border);
      border-radius: 1rem;
      background: linear-gradient(180deg, #fff, #f7fbff);
      color: var(--ff-text);
      font-weight: 700;
      cursor: pointer;
    }

    .action-button.primary {
      background: linear-gradient(135deg, #0f172a, #1d4ed8);
      color: #fff;
      border-color: transparent;
    }

    .content-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .activity-list,
    .search-list,
    .module-list {
      display: grid;
      gap: 0.7rem;
    }

    .activity-item,
    .search-item,
    .module-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      padding: 0.9rem 1rem;
      border: 1px solid var(--ff-border);
      border-radius: 1rem;
      background: linear-gradient(180deg, #fff, #f8fbff);
      text-align: left;
    }

    .search-item {
      align-items: flex-start;
      flex-direction: column;
      cursor: pointer;
    }

    .activity-item strong,
    .search-item strong,
    .module-row strong {
      display: block;
      color: var(--ff-text);
      font-weight: 700;
    }

    .status-chip,
    .result-type {
      padding: 0.35rem 0.65rem;
      border-radius: 999px;
      background: rgba(56, 189, 248, 0.12);
      color: #0f172a;
      font-size: 0.75rem;
      font-weight: 800;
    }

    .empty-state,
    .search-empty,
    .search-loading {
      padding: 0.25rem 0;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .skeleton-card {
      min-height: 7rem;
      border-radius: 1.25rem;
      border: 1px solid var(--ff-border);
      background:
        linear-gradient(90deg, rgba(215, 233, 247, 0.7), rgba(255, 255, 255, 0.95), rgba(215, 233, 247, 0.7));
      background-size: 200% 100%;
      animation: shimmer 1.2s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (max-width: 1180px) {
      .metrics-grid,
      .skeleton-grid,
      .action-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 960px) {
      .admin-shell,
      .admin-shell.collapsed {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
      }

      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .toolbar-actions,
      .search-shell {
        width: 100%;
      }

      .search-shell input {
        width: 100%;
      }
    }

    @media (max-width: 720px) {
      .metrics-grid,
      .skeleton-grid,
      .action-grid {
        grid-template-columns: 1fr;
      }

      .activity-item,
      .module-row {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  readonly sidebarCollapsed = signal(false);
  readonly dashboard = signal<AdminDashboardResponse | null>(null);
  readonly searchResults = signal<AdminSearchResponse>({ query: '', results: [] });
  readonly searchQuery = signal('');
  readonly loading = signal(true);
  readonly searchLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly skeletonCards = Array.from({ length: 8 });

  private readonly service = inject(AdminDashboardService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly scroller = inject(ViewportScroller);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.dashboard.set(response);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('The admin summary endpoint could not be loaded.');
          this.loading.set(false);
        }
      });
  }

  runSearch(query: string): void {
    const term = query.trim();
    this.searchQuery.set(term);

    if (term.length < 2) {
      this.searchResults.set({ query: term, results: [] });
      return;
    }

    this.searchLoading.set(true);
    this.service.search(term)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.searchResults.set(response);
          this.searchLoading.set(false);
        },
        error: () => {
          this.searchResults.set({ query: term, results: [] });
          this.searchLoading.set(false);
        }
      });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  scrollTo(sectionId: string): void {
    this.scroller.scrollToAnchor(sectionId);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }

  displayMetric(metric: AdminMetric): string {
    return metric.value === null ? 'No Data Found' : metric.value.toLocaleString('en-IN');
  }

  displayChange(metric: AdminMetric): string {
    return metric.todayChange ?? 'No Data Found';
  }

  iconLabel(metric: AdminMetric): string {
    return metric.icon.substring(0, 2).toUpperCase();
  }

  metricValue(metrics: AdminMetric[], key: string): string {
    const metric = metrics.find((candidate) => candidate.key === key);
    return metric ? this.displayMetric(metric) : 'No Data Found';
  }

  trackByMetric(_: number, metric: AdminMetric): string {
    return metric.key;
  }

  trackByQuickAction(_: number, item: { label: string }): string {
    return item.label;
  }

  trackByActivityGroup(_: number, item: { key: string }): string {
    return item.key;
  }

  trackByActivityItem(_: number, item: { title: string; createdAt: string }): string {
    return `${item.title}-${item.createdAt}`;
  }

  trackBySearchResult(_: number, item: { type: string; title: string; subtitle: string }): string {
    return `${item.type}-${item.title}-${item.subtitle}`;
  }
}
