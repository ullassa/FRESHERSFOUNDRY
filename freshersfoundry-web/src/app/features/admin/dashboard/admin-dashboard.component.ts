import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../../core/auth.service';
import { environment } from '../../../../environments/environment';
import {
  AdminDashboardResponse,
  AdminDashboardService,
  AdminMetric
} from '../services/admin-dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatTabsModule, MatIconModule, MatMenuModule, MatTableModule, MatChipsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  readonly dashboard = signal<AdminDashboardResponse | null>(null);
  readonly blogs = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly activeSection = signal<'jobs' | 'blogs' | 'interview-experiences' | 'interview-questions' | 'users'>('jobs');
  readonly skeletonCards = Array.from({ length: 4 });

  private readonly service = inject(AdminDashboardService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly scroller = inject(ViewportScroller);
  private readonly destroyRef = inject(DestroyRef);

  displayedJobColumns = ['title', 'subtitle', 'status', 'actions'];
  displayedQuestionColumns = ['title', 'subtitle', 'status', 'actions'];
  displayedBlogColumns = ['title', 'subtitle', 'status', 'actions'];
  displayedExperienceColumns = ['title', 'subtitle', 'status', 'actions'];

  selectedJob: any = null;
  selectedQuestion: any = null;
  selectedBlog: any = null;
  selectedExperience: any = null;

  ngOnInit(): void {
    this.loadDashboard();
    this.loadBlogs();
  }

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

  loadBlogs(): void {
    forkJoin({
      published: this.http.get(`${environment.apiBaseUrl}/blogs`).pipe(catchError(() => of({ items: [] }))),
      pending: this.http.get(`${environment.apiBaseUrl}/admin/pending-content`).pipe(catchError(() => of({ pendingBlogs: [] })))
    }).subscribe({
      next: ({ published, pending }: any) => {
        const publishedBlogs = (published?.items || published || []).map((item: any) => ({
          ...item,
          id: item.id?.toString?.() ?? item.id
        }));

        const pendingBlogs = (pending?.pendingBlogs || []).map((item: any) => ({
          ...item,
          id: item.id?.toString?.() ?? item.id
        }));

        const merged = [...pendingBlogs, ...publishedBlogs].filter((blog, index, array) =>
          index === array.findIndex((candidate) => candidate.id === blog.id)
        );

        this.blogs.set(merged);
      },
      error: () => {
        this.blogs.set([]);
      }
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
  selectBlog(blog: any): void { this.selectedBlog = blog; }
  selectExperience(experience: any): void { this.selectedExperience = experience; }

  openPostJobModal(): void { this.router.navigateByUrl('/admin/post-job'); }
  openPostBlogModal(): void { this.router.navigateByUrl('/admin/post-blog'); }
  openPostQuestionModal(): void { this.router.navigateByUrl('/admin/post-question'); }

  editJob(id?: string | null): void {
    if (!id) return;
    this.router.navigateByUrl(`/admin/post-job/${id}`);
  }

  deleteJob(id?: string | null): void {
    if (!id) return;

    const token = this.auth.getToken();
    if (!token) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.delete(`${environment.apiBaseUrl}/jobs/${id}`, { headers }).subscribe({
      next: () => this.loadDashboard(),
      error: () => this.error.set('Unable to delete the selected job.')
    });
  }

  editQuestion(id?: string | null): void {
    if (!id) return;
    this.router.navigateByUrl(`/admin/post-question/${id}`);
  }

  deleteQuestion(id?: string | null): void {
    if (!id) return;

    const token = this.auth.getToken();
    if (!token) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.delete(`${environment.apiBaseUrl}/interview-questions/${id}`, { headers }).subscribe({
      next: () => this.loadDashboard(),
      error: () => this.error.set('Unable to delete the selected question.')
    });
  }

  editBlog(id?: string | null): void {
    if (!id) return;
    this.router.navigateByUrl(`/admin/post-blog/${id}`);
  }

  deleteBlog(id?: string | null): void {
    if (!id) return;

    const token = this.auth.getToken();
    if (!token) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.delete(`${environment.apiBaseUrl}/blogs/${id}`, { headers }).subscribe({
      next: () => this.loadDashboard(),
      error: () => this.error.set('Unable to delete the selected blog.')
    });
  }

  deleteExperience(id?: string | null): void {
    if (!id) return;

    const token = this.auth.getToken();
    if (!token) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.delete(`${environment.apiBaseUrl}/interview-experiences/${id}`, { headers }).subscribe({
      next: () => this.loadDashboard(),
      error: () => this.error.set('Unable to delete the selected experience.')
    });
  }

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

  get blogsList(): any[] {
    return this.blogs();
  }

  get experiencesList(): any[] {
    const data = this.dashboard();
    if (!data) return [];
    const group = data.recentActivity?.find(g => g.key === 'experiences' || g.sectionId === 'experiences');
    return group?.items || [];
  }
}
