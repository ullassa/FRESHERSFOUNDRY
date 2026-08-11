import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  imports: [CommonModule, MatButtonModule, MatCardModule, MatTabsModule, MatIconModule, MatMenuModule, MatTableModule, MatChipsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
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

  displayedJobColumns = ['title', 'companyName', 'jobType', 'status', 'actions'];
  displayedQuestionColumns = ['title', 'difficulty', 'actions'];

  selectedJob: any = null;
  selectedQuestion: any = null;
  jobs: any;
  questions: any;

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
  deleteJob(id?: number | null): void { this.jobs = this.jobs.filter((j: { id: number | null | undefined; }) => j.id !== id); }

  editQuestion(id?: number | null): void { console.log('edit question', id); }
  deleteQuestion(id?: number | null): void { this.questions = this.questions.filter((q: { id: number | null | undefined; }) => q.id !== id); }

  // Derived lists from dashboard response
  get jobsList(): any[] {
    const data = this.dashboard();
    if (!data) return [];
    const group = data.recentActivity?.find(g => g.key === 'jobs' || g.sectionId === 'jobs');
    return group?.items || [];
  }

  get questionsList(): any[] {
    const data = this.dashboard();
    if (!data) return [];
    const group = data.recentActivity?.find(g => g.key === 'questions' || g.key === 'interview-questions' || g.sectionId === 'questions');
    return group?.items || [];
  }
}
