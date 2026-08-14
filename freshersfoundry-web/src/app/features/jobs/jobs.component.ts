import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService, JobItem } from './job.service';
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

        <main class="jobs-grid" *ngIf="!loading() && filteredJobs.length > 0; else emptyState">
          <mat-card class="job-card" *ngFor="let job of pagedJobs(); trackBy: trackByJob">
          <mat-card-header>
            <mat-card-title>{{ job.title }}</mat-card-title>
            <mat-card-subtitle>{{ job.companyName }} • {{ job.location }}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="job-card-body">
            <div class="badge-row chip-list">
                <mat-chip color="primary" selected>{{ job.jobType }}</mat-chip>
                <mat-chip *ngIf="job.experienceLevel" selected>{{ job.experienceLevel }}</mat-chip>
                <mat-chip *ngIf="job.salaryRange" selected>{{ job.salaryRange }}</mat-chip>
            </div>

            <p class="job-description">{{ job.description }}</p>

            <div class="skills-row chip-list">
                <mat-chip *ngFor="let skill of splitTags(job.skillTags)" outlined>{{ skill }}</mat-chip>
            </div>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-flat-button color="primary" (click)="openDetails(job)">
              Apply Now
              <mat-icon>open_in_new</mat-icon>
            </button>
          </mat-card-actions>
          </mat-card>
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
    .jobs-shell {
      display: grid;
      gap: 1.5rem;
    }

    .jobs-header {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .jobs-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .jobs-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; align-items:start }
    .filters { padding: 1rem; background: #fff; border-radius: 8px; border:1px solid var(--ff-border) }
    .filter-section { margin-bottom: 1rem }
    .filter-section h4 { margin: 0 0 0.5rem 0; font-size: 0.95rem }
    .search-row { display:flex; gap:0.5rem; align-items:center; margin-top:0.75rem }
    .search-field { flex: 1 }
    .count { color: rgba(15,23,42,0.5); margin-left:6px }

    .job-card {
      border-radius: 1rem;
      overflow: hidden;
      min-height: 260px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
      border: 1px solid var(--ff-border);
      box-shadow: 0 8px 30px rgba(15,23,42,0.06);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }

    .job-card:hover { transform: translateY(-6px); box-shadow: 0 18px 50px rgba(15,23,42,0.09); }

    mat-card-title { color: #0f172a; font-weight: 600; }
    mat-card-subtitle { color: rgba(15,23,42,0.6); }

    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .skills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    mat-chip {
      margin: 0.15rem;
    }

    .job-description {
      margin: 0 0 1rem;
      color: rgba(15, 23, 42, 0.78);
      min-height: 3rem;
    }

    .skills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
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

    .tag {
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.06);
      font-size: 0.8rem;
    }

    .jobs-loading {
      display: flex;
      justify-content: center;
      padding: 2rem 0;
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
    if (job.applyLink) {
      window.open(job.applyLink, '_blank');
      return;
    }

    this.router.navigateByUrl('/jobs');
  }

  splitTags(tags: string): string[] {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
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

