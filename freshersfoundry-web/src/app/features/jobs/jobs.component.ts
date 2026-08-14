import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService, JobItem } from './job.service';
import { JobDetailsDialogComponent } from './job-details-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule],
  template: `
    <div class="jobs-container">
      <div class="jobs-header">
        <h2>All Jobs</h2>
        <p>{{ filteredCount }} openings available</p>

        <div class="search-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Job title or keyword</mat-label>
            <input matInput [(ngModel)]="filters.q" placeholder="e.g. UI Designer" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Location</mat-label>
            <input matInput [(ngModel)]="filters.location" placeholder="Any location" />
          </mat-form-field>

          <button mat-flat-button color="primary" (click)="applyFilters()">Search</button>
        </div>
      </div>

      <div class="jobs-layout">
        <aside class="filters">
          <section class="filter-section">
            <h4>Type of Employment</h4>
            <div *ngFor="let t of employmentTypes">
              <mat-checkbox [(ngModel)]="t.checked" (change)="applyFilters()">{{ t.label }} <span class="count">({{ t.count }})</span></mat-checkbox>
            </div>
          </section>

          <section class="filter-section">
            <h4>Categories</h4>
            <div *ngFor="let c of categories">
              <mat-checkbox [(ngModel)]="c.checked" (change)="applyFilters()">{{ c.label }} <span class="count">({{ c.count }})</span></mat-checkbox>
            </div>
          </section>

          <section class="filter-section">
            <h4>Job Level</h4>
            <div *ngFor="let l of levels">
              <mat-checkbox [(ngModel)]="l.checked" (change)="applyFilters()">{{ l.label }} <span class="count">({{ l.count }})</span></mat-checkbox>
            </div>
          </section>

          <section class="filter-section compact">
            <h4>Experience</h4>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Experience</mat-label>
              <mat-select [(ngModel)]="filters.experience" (selectionChange)="applyFilters()">
                <mat-option [value]="''">Any</mat-option>
                <mat-option value="Fresher">Fresher</mat-option>
                <mat-option value="Experienced">Experienced</mat-option>
              </mat-select>
            </mat-form-field>
          </section>

          <section class="filter-section compact">
            <h4>Salary Range</h4>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Salary</mat-label>
              <mat-select [(ngModel)]="filters.salary" (selectionChange)="applyFilters()">
                <mat-option value="">Any</mat-option>
                <mat-option value="0-3">Up to ₹3 LPA</mat-option>
                <mat-option value="3-6">₹3 - ₹6 LPA</mat-option>
                <mat-option value="6-12">₹6 - ₹12 LPA</mat-option>
                <mat-option value="12+">₹12 LPA or above</mat-option>
              </mat-select>
            </mat-form-field>
          </section>
        </aside>

        <main class="jobs-list" *ngIf="!loading() && filteredJobs.length > 0; else emptyState">
          <div class="job-card-large" *ngFor="let job of pagedJobs(); trackBy: trackByJob">
            <!-- Company Logo -->
            <div class="job-card-left">
              <div class="company-badge" *ngIf="job.companyLogoUrl; else noJobLogo">
                <img [src]="job.companyLogoUrl" [alt]="job.companyName" class="company-logo-img" />
              </div>
              <ng-template #noJobLogo>
                <div class="company-badge">{{ getCompanyInitials(job.companyName) }}</div>
              </ng-template>
            </div>

            <!-- Job Details -->
            <div class="job-card-content">
              <div class="job-title-section">
                <h4 class="job-card-title">{{ job.title }}</h4>
                <div class="job-meta-line">
                  <span class="job-company-name">{{ job.companyName }}</span>
                  <span class="job-separator">·</span>
                  <span class="job-location">{{ job.location }}</span>
                </div>
              </div>

              <div class="job-tags">
                <span class="job-type-badge" [class.fulltime]="job.jobType === 'FullTime'" [class.internship]="job.jobType === 'Internship'" [class.contract]="job.jobType === 'Contract'">
                  {{ job.jobType === 'FullTime' ? 'Full-Time' : job.jobType === 'Internship' ? 'Internship' : 'Contract' }}
                </span>
                <span class="job-skill-tag" *ngIf="job.skillTags">{{ (job.skillTags | slice:0:30) }}{{ job.skillTags.length > 30 ? '...' : '' }}</span>
                <span class="job-skill-tag" *ngIf="job.experienceLevel">{{ job.experienceLevel }}</span>
              </div>

              <div class="job-footer">
                <span class="job-salary" *ngIf="job.salaryRange">
                  {{ job.salaryRange }}
                </span>
                <span class="job-posted">Posted {{ formatDate(job.createdAt) }}</span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="job-card-action">
              <button mat-flat-button color="primary" (click)="openDetails(job)" class="apply-btn">Apply</button>
            </div>
          </div>
        </main>

      <ng-template #emptyState>
        <div class="empty-jobs">
          <mat-icon>work_off</mat-icon>
          <h3>No approved jobs currently available</h3>
          <p>Check back soon for new opportunities!</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .jobs-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .filters {
      padding: 1rem;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e8e8e8;
      height: fit-content;
    }

    .filter-section {
      margin-bottom: 1rem;
    }

    .filter-section h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .search-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.75rem;
    }

    .search-field {
      flex: 1;
    }

    .count {
      color: rgba(15, 23, 42, 0.5);
      margin-left: 6px;
    }

    .jobs-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .job-card-large {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1.5rem;
      align-items: center;
      padding: 1.5rem;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 0.8rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .job-card-large:hover {
      border-color: #4f46e5;
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.12);
    }

    .job-card-left {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .company-badge {
      width: 50px;
      height: 50px;
      border-radius: 0.6rem;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
      overflow: hidden;
    }

    .company-logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .job-card-content {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .job-title-section {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .job-card-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.4;
    }

    .job-meta-line {
      font-size: 0.9rem;
      color: #666;
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }

    .job-company-name {
      font-weight: 600;
      color: #4f46e5;
    }

    .job-separator {
      color: #ddd;
    }

    .job-location {
      color: #999;
    }

    .job-tags {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .job-type-badge {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.4rem 0.8rem;
      border-radius: 0.4rem;
      background: #e8e8e8;
      color: #666;
      display: inline-block;
    }

    .job-type-badge.fulltime {
      background: rgba(79, 70, 229, 0.1);
      color: #4f46e5;
    }

    .job-type-badge.internship {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .job-type-badge.contract {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .job-skill-tag {
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.4rem 0.8rem;
      border-radius: 0.4rem;
      background: #f0f0f0;
      color: #666;
      display: inline-block;
    }

    .job-footer {
      display: flex;
      gap: 1.2rem;
      align-items: center;
      font-size: 0.85rem;
      color: #999;
      flex-wrap: wrap;
    }

    .job-salary {
      font-weight: 600;
      color: #1a1a1a;
    }

    .job-posted {
      color: #999;
    }

    .job-card-action {
      display: flex;
      justify-content: flex-end;
    }

    .apply-btn {
      padding: 0.7rem 1.6rem !important;
      font-weight: 700 !important;
      font-size: 0.95rem !important;
      white-space: nowrap;
    }

    .job-card-large:hover .apply-btn {
      background: #3f3ad8 !important;
    }

    .empty-jobs {
      display: grid;
      place-items: center;
      gap: 0.75rem;
      padding: 2rem;
      text-align: center;
      color: rgba(15, 23, 42, 0.72);
    }

    .empty-jobs mat-icon {
      font-size: 3rem;
      color: rgba(56, 189, 248, 0.8);
    }

    .jobs-loading {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
    }

    @media (max-width: 768px) {
      .jobs-layout {
        grid-template-columns: 1fr;
      }

      .job-card-large {
        grid-template-columns: auto 1fr;
        gap: 1rem;
        padding: 1rem;
      }

      .job-card-action {
        grid-column: 2;
        margin-top: 0.5rem;
      }

      .apply-btn {
        width: 100%;
        text-align: center;
      }

      .job-tags {
        gap: 0.4rem;
      }

      .job-skill-tag,
      .job-type-badge {
        font-size: 0.75rem;
        padding: 0.3rem 0.6rem;
      }
    }
  `]
})
export class JobsComponent {
  private readonly jobService = inject(JobService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly jobs = signal<JobItem[]>([]);
  readonly loading = signal(true);

  allJobs: JobItem[] = [];
  filteredJobs: JobItem[] = [];
  filteredCount = 0;

  // filters & facets
  filters: any = { q: '', location: '', experience: '', salary: '' };
  employmentTypes = [
    { key: 'FullTime', label: 'Full-Time', checked: false, count: 0 },
    { key: 'Internship', label: 'Internship', checked: false, count: 0 },
    { key: 'Contract', label: 'Contract', checked: false, count: 0 }
  ];
  categories: any[] = [ { key: 'Technology', label: 'Technology', checked:false, count:0 }, { key: 'Business', label:'Business', checked:false, count:0 } ];
  levels: any[] = [ { key: 'Entry', label: 'Entry Level', checked:false, count:0 }, { key: 'Mid', label:'Mid Level', checked:false, count:0 }, { key: 'Senior', label:'Senior Level', checked:false, count:0 } ];

  // pagination
  page = 1; pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.jobService.getApprovedJobsWithQuery(this.buildApiParams()).subscribe({
      next: (res) => {
        this.allJobs = res.items || [];
        this.applyLocalFilters();
        this.computeFacetCounts();
        this.loading.set(false);
      },
      error: () => {
        this.allJobs = [];
        this.filteredJobs = [];
        this.filteredCount = 0;
        this.jobs.set([]);
        this.loading.set(false);
      }
    });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  edit(id: string): void {
    this.router.navigateByUrl(`/admin/post-job/${id}`);
  }

  delete(id: string): void {
    if (!confirm('Delete this job?')) return;
    this.router.navigateByUrl(`/admin/post-job/${id}`);
  }

  apply(url: string): void {
    window.open(url, '_blank');
  }

  openDetails(job: JobItem): void {
    this.dialog.open(JobDetailsDialogComponent, {
      data: {
        id: job.id,
        title: job.title,
        companyName: job.companyName,
        companyLogoUrl: job.companyLogoUrl,
        location: job.location,
        jobType: job.jobType,
        experienceLevel: job.experienceLevel,
        salaryRange: job.salaryRange,
        skillTags: job.skillTags,
        description: job.description,
        applyLink: job.applyLink,
        createdAt: job.createdAt
      },
      width: '90%',
      maxWidth: '900px',
      maxHeight: '90vh',
      panelClass: 'job-details-dialog'
    });
  }

  splitTags(tags: string): string[] {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  getCompanyInitials(companyName: string): string {
    return companyName
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'yesterday';
    }

    const daysAgo = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return `${daysAgo} days ago`;
    }

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  }

  private buildApiParams(): Record<string, string | string[] | undefined> {
    const params: Record<string, string | string[] | undefined> = {};
    const q = (this.filters.q || '').trim();
    if (q) {
      params['skill'] = q;
    }
    if (this.filters.location) {
      params['location'] = this.filters.location.trim();
    }
    const selectedTypes = this.employmentTypes.filter(t => t.checked).map(t => t.key);
    if (selectedTypes.length === 1) {
      params['type'] = selectedTypes[0];
    }
    return params;
  }

  private applyLocalFilters(): void {
    let items = [...this.allJobs];
    const q = (this.filters.q || '').toLowerCase().trim();
    if (q) {
      items = items.filter(j => (j.title + ' ' + j.description + ' ' + j.skillTags).toLowerCase().includes(q));
    }
    if (this.filters.location) {
      const loc = this.filters.location.toLowerCase();
      items = items.filter(j => j.location.toLowerCase().includes(loc));
    }
    const selectedTypes = this.employmentTypes.filter(t => t.checked).map(t => t.key);
    if (selectedTypes.length) {
      items = items.filter(j => selectedTypes.includes(j.jobType));
    }
    if (this.filters.experience) {
      items = items.filter(j => (j.experienceLevel || '').toLowerCase().includes(this.filters.experience.toLowerCase()));
    }
    if (this.filters.salary) {
      items = items.filter(j => (j.salaryRange || '').includes(this.filters.salary.replace('+','')));
    }
    const selectedCategories = this.categories.filter(c => c.checked).map(c => c.key.toLowerCase());
    if (selectedCategories.length) {
      items = items.filter(j => selectedCategories.some(category => (j.skillTags || '').toLowerCase().includes(category)));
    }
    const selectedLevels = this.levels.filter(l => l.checked).map(l => l.key.toLowerCase());
    if (selectedLevels.length) {
      items = items.filter(j => selectedLevels.some(level => (j.experienceLevel || '').toLowerCase().includes(level)));
    }

    this.filteredJobs = items;
    this.filteredCount = items.length;
    this.page = 1;
    this.jobs.set(this.filteredJobs);
  }

  applyFilters(): void {
    this.load();
  }

  computeFacetCounts(): void {
    // reset counts from allJobs
    const total = this.allJobs.length;
    this.employmentTypes.forEach(t => t.count = this.allJobs.filter(j => j.jobType === t.key).length);
    // categories and levels are placeholders — count based on tags/experience
    this.categories.forEach(c => c.count = this.allJobs.filter(j => (j.skillTags || '').toLowerCase().includes(c.key.toLowerCase())).length);
    this.levels.forEach(l => l.count = this.allJobs.filter(j => (j.experienceLevel || '').toLowerCase().includes(l.key.toLowerCase())).length);
  }

  pagedJobs(): JobItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  trackByJob(_: number, job: JobItem): string {
    return job.id;
  }
}

