import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/auth.service';
import {
  AdminDashboardResponse,
  AdminDashboardService,
  AdminMetric
} from './admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatTabsModule, MatIconModule, MatMenuModule, MatTableModule, MatChipsModule],
  template: `
    <div class="admin-page">
      <section class="hero" *ngIf="dashboard() as data">
        <div>
          <p class="eyebrow">Admin control room</p>
          <h1>Manage the MVP without the clutter</h1>
          <p class="supporting-text">Keep jobs, blogs, interview experiences, interview questions, and users in one clean workspace.</p>
        </div>

        <div class="hero-actions banner-actions">
          <button mat-flat-button color="primary" (click)="openPostJobModal()">
            <mat-icon>add</mat-icon>
            Post Job
          </button>
          <button mat-stroked-button color="primary" (click)="openPostBlogModal()">
            <mat-icon>add</mat-icon>
            Post Blog
          </button>
          <button mat-stroked-button color="primary" (click)="openPostQuestionModal()">
            <mat-icon>add</mat-icon>
            Post Question
          </button>
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

      <mat-tab-group animationDuration="200ms" class="admin-tabs" *ngIf="dashboard() as data">
        <mat-tab label="Jobs">
          <div class="tab-content">
            <div class="tab-header">
              <h3>Live Jobs ({{ jobs.length }})</h3>
              <button mat-raised-button color="primary" (click)="openPostJobModal()">+ Post New Job</button>
            </div>

            <table mat-table [dataSource]="jobs" class="mat-elevation-z1 admin-table">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef> Title </th>
                <td mat-cell *matCellDef="let element"> {{element.title}} </td>
              </ng-container>

              <ng-container matColumnDef="companyName">
                <th mat-header-cell *matHeaderCellDef> Company </th>
                <td mat-cell *matCellDef="let element"> {{element.companyName}} </td>
              </ng-container>

              <ng-container matColumnDef="jobType">
                <th mat-header-cell *matHeaderCellDef> Type </th>
                <td mat-cell *matCellDef="let element"> <span class="type-badge">{{element.jobType}}</span> </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let element">
                  <mat-chip [color]="element.status === 'Approved' ? 'accent' : 'warn'" selected>
                    {{element.status}}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button [matMenuTriggerFor]="jobMenu" (click)="selectJob(element)">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedJobColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedJobColumns;"></tr>
            </table>

            <mat-menu #jobMenu="matMenu">
              <button mat-menu-item (click)="editJob(selectedJob?.id)">Edit</button>
              <button mat-menu-item (click)="deleteJob(selectedJob?.id)">Delete</button>
            </mat-menu>
          </div>
        </mat-tab>

        <mat-tab label="Interview Questions">
          <div class="tab-content">
            <div class="tab-header">
              <h3>Questions Repository</h3>
              <button mat-raised-button color="primary" (click)="openPostQuestionModal()">+ Post Question</button>
            </div>

            <table mat-table [dataSource]="questions" class="mat-elevation-z1 admin-table">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef> Title </th>
                <td mat-cell *matCellDef="let element"> {{element.title}} </td>
              </ng-container>

              <ng-container matColumnDef="difficulty">
                <th mat-header-cell *matHeaderCellDef> Difficulty </th>
                <td mat-cell *matCellDef="let element"> {{element.difficulty}} </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef> Actions </th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button [matMenuTriggerFor]="questionMenu" (click)="selectQuestion(element)">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedQuestionColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedQuestionColumns;"></tr>
            </table>

            <mat-menu #questionMenu="matMenu">
              <button mat-menu-item (click)="editQuestion(selectedQuestion?.id)">Edit</button>
              <button mat-menu-item (click)="deleteQuestion(selectedQuestion?.id)">Delete</button>
            </mat-menu>
          </div>
        </mat-tab>

        <mat-tab label="Blogs">
          <div class="tab-content">
            <div class="tab-header">
              <h3>Blogs</h3>
              <button mat-raised-button color="primary" (click)="openPostBlogModal()">+ Post Blog</button>
            </div>
            <!-- Blogs table could go here -->
          </div>
        </mat-tab>

        <mat-tab label="Interview Experiences">
          <div class="tab-content">
            <h3>Interview Experiences</h3>
            <!-- Experiences table could go here -->
          </div>
        </mat-tab>

        <mat-tab label="Users">
          <div class="tab-content">
            <h3>Users</h3>
            <!-- Users table could go here -->
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    :host { display: block; }
    h1, h2, p { margin: 0; }
    .admin-page { display: flex; flex-direction: column; gap: 1rem; }
    .hero { display: flex; justify-content: space-between; gap: 1rem; align-items: end; padding: 1.25rem; border: 1px solid var(--ff-border); border-radius: 1.5rem; background: rgba(255,255,255,0.88); box-shadow: var(--ff-shadow); backdrop-filter: blur(12px); }
    .eyebrow { color: var(--ff-cta); font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; }
    h1 { font-size: clamp(1.9rem, 4vw, 3rem); line-height: 1.05; letter-spacing: -0.05em; }
    .supporting-text { color: var(--ff-muted); line-height: 1.65; max-width: 54rem; margin-top: 0.65rem; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: end; }
    .banner-actions { display:flex; gap:12px; align-items:center; }
    .state-panel, .metric-grid, .management-grid { display: grid; gap: 1rem; }
    .metric-grid { grid-template-columns: repeat(4, minmax(0,1fr)); }
    .metric-card { display: grid; gap: 0.35rem; min-height:7rem; }
    .metric-label, .section-eyebrow, .management-card p { color: var(--ff-muted); }
    .metric-card strong, .management-card h2 { color: var(--ff-text); line-height: 1; }
    .metric-card strong { font-size: 1.8rem; }
    .admin-tabs { margin-top: 24px; background: #fff; border-radius: 12px; padding: 16px; }
    .tab-content { padding: 16px 0; }
    .tab-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .admin-table { width:100%; border-radius:8px; overflow:hidden; }
    th { background-color:#f1f5f9; color:#475569; font-weight:600; }
    td { color:#1e293b; }
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

  // Placeholder table data
  jobs = [
    { id: 1, title: 'Backend Engineer', companyName: 'Acme Corp', jobType: 'Full-time', status: 'Approved' },
    { id: 2, title: 'Frontend Developer', companyName: 'FreshersFoundry', jobType: 'Contract', status: 'Pending' }
  ];
  displayedJobColumns = ['title', 'companyName', 'jobType', 'status', 'actions'];

  questions = [
    { id: 1, title: 'Two Sum', difficulty: 'Easy' },
    { id: 2, title: 'Design a Rate Limiter', difficulty: 'Medium' }
  ];
  displayedQuestionColumns = ['title', 'difficulty', 'actions'];

  selectedJob: any = null;
  selectedQuestion: any = null;

  ngOnInit(): void { this.loadDashboard(); }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => { this.dashboard.set(response); this.loading.set(false); },
        error: () => { this.error.set('The admin summary endpoint could not be loaded.'); this.loading.set(false); }
      });
  }

  scrollTo(sectionId: string): void {
    this.activeSection.set(sectionId as any);
    this.scroller.scrollToAnchor(sectionId);
  }

  logout(): void { this.auth.logout(); this.router.navigateByUrl('/auth/login'); }

  metricValue(metrics: AdminMetric[], key: string): string {
    const metric = metrics.find((candidate) => candidate.key === key);
    return metric?.value === null || metric?.value === undefined ? '0' : metric.value.toLocaleString('en-IN');
  }

  selectJob(job: any): void { this.selectedJob = job; }
  selectQuestion(q: any): void { this.selectedQuestion = q; }

  openPostJobModal(): void { this.router.navigateByUrl('/admin/post-job'); }
  openPostBlogModal(): void { this.router.navigateByUrl('/admin/post-blog'); }
  openPostQuestionModal(): void { this.router.navigateByUrl('/admin/post-question'); }

  editJob(id?: number | null): void { console.log('edit job', id); }
  deleteJob(id?: number | null): void { this.jobs = this.jobs.filter((j) => j.id !== id); }

  editQuestion(id?: number | null): void { console.log('edit question', id); }
  deleteQuestion(id?: number | null): void { this.questions = this.questions.filter((q) => q.id !== id); }
}
