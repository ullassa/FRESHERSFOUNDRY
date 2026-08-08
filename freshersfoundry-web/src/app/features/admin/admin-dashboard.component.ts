import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/auth.service';
import {
  AdminDashboardResponse,
  AdminDashboardService,
  AdminMetric
} from './admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatTabsModule],
  template: `
    <div class="admin-page">
      <section class="hero" *ngIf="dashboard() as data">
        <div>
          <p class="eyebrow">Admin control room</p>
          <h1>Manage the MVP without the clutter</h1>
          <p class="supporting-text">Keep jobs, blogs, interview experiences, interview questions, and users in one clean workspace.</p>
        </div>

        <div class="hero-actions">
          <a mat-flat-button color="primary" routerLink="/admin/post-job">Post job</a>
          <a mat-stroked-button routerLink="/admin/post-blog">Post blog</a>
          <a mat-stroked-button routerLink="/admin/post-question">Post question</a>
        </div>
      </section>

      <section class="state-panel" *ngIf="loading()">
        <mat-card class="loading-card">
          <div class="skeleton-grid">
            <div class="skeleton-card" *ngFor="let item of skeletonCards"></div>
          </div>
        </mat-card>
      </section>

      <section class="state-panel error-panel" *ngIf="error() as errorMessage">
        <mat-card>
          <strong>Unable to load dashboard.</strong>
          <p>{{ errorMessage }}</p>
        </mat-card>
      </section>

      <section class="metric-grid" *ngIf="dashboard() as data">
        <mat-card class="metric-card">
          <span class="metric-label">Total Users</span>
          <strong>{{ metricValue(data.metrics, 'users') }}</strong>
        </mat-card>

        <mat-card class="metric-card">
          <span class="metric-label">Active Jobs</span>
          <strong>{{ metricValue(data.metrics, 'activeJobs') }}</strong>
        </mat-card>

        <mat-card class="metric-card">
          <span class="metric-label">Pending Approvals</span>
          <strong>{{ metricValue(data.metrics, 'pendingApprovals') }}</strong>
        </mat-card>

        <mat-card class="metric-card">
          <span class="metric-label">Interview Questions</span>
          <strong>{{ metricValue(data.metrics, 'questions') }}</strong>
        </mat-card>
      </section>

      <nav mat-tab-nav-bar class="section-tabs" *ngIf="dashboard() as data">
        <a mat-tab-link href="#jobs" [active]="activeSection() === 'jobs'" (click)="scrollTo('jobs')">Jobs</a>
        <a mat-tab-link href="#blogs" [active]="activeSection() === 'blogs'" (click)="scrollTo('blogs')">Blogs</a>
        <a mat-tab-link href="#interview-experiences" [active]="activeSection() === 'interview-experiences'" (click)="scrollTo('interview-experiences')">Interview Experiences</a>
        <a mat-tab-link href="#interview-questions" [active]="activeSection() === 'interview-questions'" (click)="scrollTo('interview-questions')">Interview Questions</a>
        <a mat-tab-link href="#users" [active]="activeSection() === 'users'" (click)="scrollTo('users')">Users</a>
      </nav>

      <section class="management-grid" *ngIf="dashboard() as data">
        <mat-card class="management-card" id="jobs">
          <p class="section-eyebrow">Jobs</p>
          <h2>{{ metricValue(data.metrics, 'activeJobs') }} live jobs</h2>
          <p>{{ metricValue(data.metrics, 'pendingJobs') }} pending jobs are waiting for moderation.</p>
          <div class="card-actions">
            <a mat-flat-button color="primary" routerLink="/admin/post-job">Post job</a>
            <a mat-button routerLink="/admin/pending-approvals">Review approvals</a>
          </div>
        </mat-card>

        <mat-card class="management-card" id="blogs">
          <p class="section-eyebrow">Blogs</p>
          <h2>{{ metricValue(data.metrics, 'pendingBlogs') }} pending blogs</h2>
          <p>Publish editorial content without exposing non-MVP modules.</p>
          <div class="card-actions">
            <a mat-flat-button color="primary" routerLink="/admin/post-blog">Post blog</a>
            <a mat-button routerLink="/admin/pending-approvals">Review approvals</a>
          </div>
        </mat-card>

        <mat-card class="management-card" id="interview-experiences">
          <p class="section-eyebrow">Interview Experiences</p>
          <h2>{{ metricValue(data.metrics, 'pendingExperiences') }} pending stories</h2>
          <p>Approve experience submissions and keep the feed curated.</p>
          <div class="card-actions">
            <a mat-flat-button color="primary" routerLink="/admin/pending-approvals">Review approvals</a>
          </div>
        </mat-card>

        <mat-card class="management-card" id="interview-questions">
          <p class="section-eyebrow">Interview Questions</p>
          <h2>{{ metricValue(data.metrics, 'questions') }} questions</h2>
          <p>Post clean interview content using structured outline fields.</p>
          <div class="card-actions">
            <a mat-flat-button color="primary" routerLink="/admin/post-question">Post question</a>
          </div>
        </mat-card>

        <mat-card class="management-card" id="users">
          <p class="section-eyebrow">Users</p>
          <h2>{{ metricValue(data.metrics, 'users') }} users</h2>
          <p>Monitor platform growth and keep the admin surface focused.</p>
        </mat-card>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    h1, h2, p {
      margin: 0;
    }

    .admin-page {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: end;
      padding: 1.25rem;
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
      font-size: clamp(1.9rem, 4vw, 3rem);
      line-height: 1.05;
      letter-spacing: -0.05em;
    }

    .supporting-text {
      color: var(--ff-muted);
      line-height: 1.65;
      max-width: 54rem;
      margin-top: 0.65rem;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: end;
    }

    .state-panel,
    .metric-grid,
    .management-grid {
      display: grid;
      gap: 1rem;
    }

    .metric-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .metric-card {
      display: grid;
      gap: 0.35rem;
      min-height: 7rem;
    }

    .metric-label,
    .section-eyebrow,
    .management-card p {
      color: var(--ff-muted);
    }

    .metric-card strong,
    .management-card h2 {
      color: var(--ff-text);
      line-height: 1;
    }

    .metric-card strong {
      font-size: 1.8rem;
    }

    .section-tabs {
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid var(--ff-border);
      border-radius: 1rem;
      padding: 0.25rem 0.5rem 0;
      box-shadow: var(--ff-shadow);
    }

    .management-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .management-card {
      display: grid;
      gap: 0.75rem;
      align-content: start;
    }

    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .loading-card {
      min-height: 8rem;
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

    @media (max-width: 1024px) {
      .metric-grid,
      .management-grid,
      .skeleton-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 960px) {
      .hero {
        flex-direction: column;
        align-items: stretch;
      }

      .hero-actions {
        width: 100%;
        justify-content: flex-start;
      }
    }

    @media (max-width: 720px) {
      .metric-grid,
      .management-grid,
      .skeleton-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  readonly dashboard = signal<AdminDashboardResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeSection = signal<'jobs' | 'blogs' | 'interview-experiences' | 'interview-questions' | 'users'>('jobs');
  readonly skeletonCards = Array.from({ length: 4 });

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

  scrollTo(sectionId: string): void {
    this.activeSection.set(sectionId as 'jobs' | 'blogs' | 'interview-experiences' | 'interview-questions' | 'users');
    this.scroller.scrollToAnchor(sectionId);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/auth/login');
  }

  metricValue(metrics: AdminMetric[], key: string): string {
    const metric = metrics.find((candidate) => candidate.key === key);
    return metric?.value === null || metric?.value === undefined ? '0' : metric.value.toLocaleString('en-IN');
  }

  pendingContent(metrics: AdminMetric[]): string {
    const pendingApprovals = this.metricNumber(metrics, 'pendingApprovals');
    return pendingApprovals.toLocaleString('en-IN');
  }

  private metricNumber(metrics: AdminMetric[], key: string): number {
    const metric = metrics.find((candidate) => candidate.key === key);
    return metric?.value ?? 0;
  }
}